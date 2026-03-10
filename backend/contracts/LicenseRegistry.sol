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
    
    mapping(string => License) private licenses;
    mapping(string => bool) private licenseExists;
    mapping(address => bool) public authorizedRegulators;
    mapping(address => string[]) private holderLicenses; // Track licenses per holder
    
    event LicenseRegistered(string licenseId, string licenseType, string businessName, address indexed issuer);
    event LicenseRevoked(string licenseId, address indexed revoker);
    event LicenseSuspended(string licenseId, address indexed suspender);
    event LicenseReinstated(string licenseId, address indexed reinstater);
    event RegulatorAdded(address indexed regulator);
    event RegulatorRemoved(address indexed regulator);

    modifier onlyRegulator() {
        require(authorizedRegulators[msg.sender], "Not an authorized regulator");
        _;
    }

    modifier licenseMustExist(string memory licenseId) {
        require(licenseExists[licenseId], "License does not exist");
        _;
    }

    constructor() {
        authorizedRegulators[msg.sender] = true; // Deployer is the first regulator
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
}
