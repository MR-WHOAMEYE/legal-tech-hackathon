// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LicenseRegistry {
    enum LicenseStatus { Active, Suspended, Revoked }
    
    struct License {
        string licenseId;
        string licenseType; // e.g., GST, Trade, FSSAI, Incorporation
        string businessName;
        address holderAddress;
        address issuerAddress;
        uint256 issueDate;
        uint256 expiryDate;
        LicenseStatus status;
        string documentHash;
    }

    // ═══════════════════════════════════════════════════════════════
    // ZERO-KNOWLEDGE PRIVACY PROOF
    // ═══════════════════════════════════════════════════════════════
    struct PrivacyProof {
        bool exists;
        string licenseType;   // only this is revealed to verifier
        string licenseId;     // internal — never returned to verifier
        uint256 createdAt;
        uint256 validUntil;
    }
    
    mapping(string => License) private licenses;
    mapping(string => bool) private licenseExists;
    mapping(address => bool) public authorizedRegulators;
    mapping(address => string[]) private holderLicenses;
    mapping(bytes32 => PrivacyProof) private privacyProofs; // ZKP storage
    
    event LicenseRegistered(string licenseId, string licenseType, string businessName, address indexed issuer);
    event LicenseRevoked(string licenseId, address indexed revoker);
    event LicenseSuspended(string licenseId, address indexed suspender);
    event LicenseReinstated(string licenseId, address indexed reinstater);
    event RegulatorAdded(address indexed regulator);
    event RegulatorRemoved(address indexed regulator);
    event PrivacyProofCreated(bytes32 indexed proofHash, string licenseType, uint256 validUntil);
    event PrivacyProofVerified(bytes32 indexed proofHash, bool isValid);

    modifier onlyRegulator() {
        require(authorizedRegulators[msg.sender], "Not an authorized regulator");
        _;
    }

    modifier licenseMustExist(string memory licenseId) {
        require(licenseExists[licenseId], "License does not exist");
        _;
    }

    constructor() {
        authorizedRegulators[msg.sender] = true;
    }

    function addRegulator(address regulator) external onlyRegulator {
        authorizedRegulators[regulator] = true;
        emit RegulatorAdded(regulator);
    }

    function removeRegulator(address regulator) external onlyRegulator {
        authorizedRegulators[regulator] = false;
        emit RegulatorRemoved(regulator);
    }

    function registerLicense(
        string memory _licenseId,
        string memory _licenseType,
        string memory _businessName,
        address _holderAddress,
        uint256 _expiryDate,
        string memory _documentHash
    ) external onlyRegulator {
        require(!licenseExists[_licenseId], "License already registered");

        licenses[_licenseId] = License({
            licenseId: _licenseId,
            licenseType: _licenseType,
            businessName: _businessName,
            holderAddress: _holderAddress,
            issuerAddress: msg.sender,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            status: LicenseStatus.Active,
            documentHash: _documentHash
        });
        
        licenseExists[_licenseId] = true;
        holderLicenses[_holderAddress].push(_licenseId);
        
        emit LicenseRegistered(_licenseId, _licenseType, _businessName, msg.sender);
    }

    function verifyLicense(string memory _licenseId) external view returns (License memory) {
        require(licenseExists[_licenseId], "License not found");
        return licenses[_licenseId];
    }

    function getLicensesByHolder(address _holder) external view returns (string[] memory) {
        return holderLicenses[_holder];
    }

    function revokeLicense(string memory _licenseId) external onlyRegulator licenseMustExist(_licenseId) {
        licenses[_licenseId].status = LicenseStatus.Revoked;
        emit LicenseRevoked(_licenseId, msg.sender);
    }

    function suspendLicense(string memory _licenseId) external onlyRegulator licenseMustExist(_licenseId) {
        licenses[_licenseId].status = LicenseStatus.Suspended;
        emit LicenseSuspended(_licenseId, msg.sender);
    }

    function reinstateLicense(string memory _licenseId) external onlyRegulator licenseMustExist(_licenseId) {
        require(licenses[_licenseId].status != LicenseStatus.Active, "License is already active");
        licenses[_licenseId].status = LicenseStatus.Active;
        emit LicenseReinstated(_licenseId, msg.sender);
    }

    // ═══════════════════════════════════════════════════════════════
    // ZERO-KNOWLEDGE PROOF FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a privacy proof for a license. The proof allows verification
     *         of license validity WITHOUT revealing any sensitive business information.
     * @dev    Only authorized regulators (or the backend acting as one) can create proofs.
     *         The proofHash is a keccak256 commitment computed off-chain from (licenseId + nonce).
     *         The nonce is secret — only the proof holder knows it.
     * @param _licenseId  The license to create a proof for
     * @param _proofHash  The keccak256 commitment hash (computed off-chain)
     * @param _validFor   Duration in seconds the proof remains valid
     */
    function createPrivacyProof(
        string memory _licenseId,
        bytes32 _proofHash,
        uint256 _validFor
    ) external onlyRegulator licenseMustExist(_licenseId) {
        require(!privacyProofs[_proofHash].exists, "Proof hash already used");
        require(_validFor > 0 && _validFor <= 30 days, "Validity must be between 1 second and 30 days");

        License memory lic = licenses[_licenseId];

        privacyProofs[_proofHash] = PrivacyProof({
            exists: true,
            licenseType: lic.licenseType,
            licenseId: _licenseId,
            createdAt: block.timestamp,
            validUntil: block.timestamp + _validFor
        });

        emit PrivacyProofCreated(_proofHash, lic.licenseType, block.timestamp + _validFor);
    }

    /**
     * @notice Verify a privacy proof. Returns ONLY whether the license is valid
     *         and its type. No business name, ID, holder, or dates are revealed.
     * @dev    This is the "zero-knowledge" aspect — the verifier learns the minimum
     *         required information: (1) a valid proof exists, (2) the license is active,
     *         (3) what type of license it is.
     * @param _proofHash The proof hash to verify
     * @return proofExists  Whether this proof hash was registered
     * @return isValid      Whether the underlying license is currently active AND proof hasn't expired
     * @return licenseType  The type of license (e.g., "GST", "Trade") — only if valid
     * @return proofValidUntil  Timestamp when this proof expires
     */
    function verifyPrivacyProof(bytes32 _proofHash) external view returns (
        bool proofExists,
        bool isValid,
        string memory licenseType,
        uint256 proofValidUntil
    ) {
        PrivacyProof memory p = privacyProofs[_proofHash];
        
        if (!p.exists) {
            return (false, false, "", 0);
        }

        License memory lic = licenses[p.licenseId];
        bool licenseActive = lic.status == LicenseStatus.Active && block.timestamp < lic.expiryDate;
        bool proofNotExpired = block.timestamp < p.validUntil;

        return (
            true,
            licenseActive && proofNotExpired,
            licenseActive && proofNotExpired ? lic.licenseType : "",
            p.validUntil
        );
    }
}
