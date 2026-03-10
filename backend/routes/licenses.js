import express from 'express';
import { ethers } from 'ethers';
import { getContract } from '../config/blockchain.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. REGISTER LICENSE (Regulator Only)
router.post('/register', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { licenseId, licenseType, businessName, holderAddress, expiryDate, documentHash } = req.body;
        const contract = getContract();

        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        console.log(`Registering license ${licenseId} on-chain...`);
        const tx = await contract.registerLicense(
            licenseId,
            licenseType,
            businessName,
            holderAddress,
            Math.floor(new Date(expiryDate).getTime() / 1000),
            documentHash
        );

        const receipt = await tx.wait();

        res.status(201).json({
            message: 'License registered securely on the blockchain',
            txHash: receipt.hash
        });

    } catch (err) {
        console.error("License registration error:", err.reason || err.message);
        res.status(500).json({ error: 'Failed to register license on blockchain: ' + (err.reason || err.message) });
    }
});


// 2. VERIFY LICENSE (Public/Verifier)
router.get('/verify/:licenseId', async (req, res) => {
    try {
        const { licenseId } = req.params;
        const contract = getContract();

        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        const data = await contract.verifyLicense(licenseId);

        const license = {
            licenseId: data.licenseId,
            licenseType: data.licenseType,
            businessName: data.businessName,
            holderAddress: data.holderAddress,
            issuerAddress: data.issuerAddress,
            issueDate: new Date(Number(data.issueDate) * 1000).toISOString(),
            expiryDate: new Date(Number(data.expiryDate) * 1000).toISOString(),
            status: Number(data.status),
            statusString: Number(data.status) === 0 ? 'Active' : (Number(data.status) === 1 ? 'Suspended' : 'Revoked'),
            documentHash: data.documentHash,
            isValid: Number(data.status) === 0 && (Number(data.expiryDate) * 1000) > Date.now()
        };

        res.json({ license });

    } catch (err) {
        console.error("License verification error:", err.reason || err.message);
        if (err.message && err.message.includes('License not found')) {
            return res.status(404).json({ error: 'License not found on the blockchain' });
        }
        res.status(500).json({ error: 'Failed to verify license: ' + (err.reason || err.message) });
    }
});


// 3. GET LICENSES BY HOLDER ADDRESS (Business)
router.get('/business/:address', auth, async (req, res) => {
    try {
        const { address } = req.params;
        const contract = getContract();

        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        const licenseIds = await contract.getLicensesByHolder(address);

        const licenses = [];
        for (const id of licenseIds) {
            try {
                const data = await contract.verifyLicense(id);
                licenses.push({
                    licenseId: data.licenseId,
                    licenseType: data.licenseType,
                    businessName: data.businessName,
                    holderAddress: data.holderAddress,
                    issuerAddress: data.issuerAddress,
                    issueDate: new Date(Number(data.issueDate) * 1000).toISOString(),
                    expiryDate: new Date(Number(data.expiryDate) * 1000).toISOString(),
                    status: Number(data.status),
                    statusString: Number(data.status) === 0 ? 'Active' : (Number(data.status) === 1 ? 'Suspended' : 'Revoked'),
                    documentHash: data.documentHash,
                    isValid: Number(data.status) === 0 && (Number(data.expiryDate) * 1000) > Date.now()
                });
            } catch (e) {
                console.error(`Failed to fetch license ${id}:`, e.reason || e.message);
            }
        }

        res.json({ licenses });

    } catch (err) {
        console.error("Get business licenses error:", err.reason || err.message);
        res.status(500).json({ error: 'Failed to get licenses: ' + (err.reason || err.message) });
    }
});


// 4. REVOKE LICENSE (Regulator Only)
router.put('/:licenseId/revoke', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { licenseId } = req.params;
        const contract = getContract();

        const tx = await contract.revokeLicense(licenseId);
        await tx.wait();

        res.json({ message: `License ${licenseId} revoked successfully`, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.reason || err.message });
    }
});


// 5. SUSPEND LICENSE (Regulator Only)
router.put('/:licenseId/suspend', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { licenseId } = req.params;
        const contract = getContract();

        const tx = await contract.suspendLicense(licenseId);
        await tx.wait();

        res.json({ message: `License ${licenseId} suspended successfully`, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.reason || err.message });
    }
});


// 6. REINSTATE LICENSE (Regulator Only)
router.put('/:licenseId/reinstate', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { licenseId } = req.params;
        const contract = getContract();

        const tx = await contract.reinstateLicense(licenseId);
        await tx.wait();

        res.json({ message: `License ${licenseId} reinstated successfully`, txHash: tx.hash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.reason || err.message });
    }
});


// ═══════════════════════════════════════════════════════════════
// ZERO-KNOWLEDGE PROOF (ZKP) ROUTES
// ═══════════════════════════════════════════════════════════════

// 7. CREATE PRIVACY PROOF (Authenticated user — business or regulator)
router.post('/zk/create-proof', auth, async (req, res) => {
    try {
        const { licenseId } = req.body;
        if (!licenseId) return res.status(400).json({ error: 'licenseId is required' });

        const contract = getContract();
        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        // Generate a random nonce to create a unique, unlinkable proof hash
        const nonce = ethers.hexlify(ethers.randomBytes(32));
        const proofHash = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ['string', 'bytes32'],
                [licenseId, nonce]
            )
        );

        // Proof is valid for 24 hours (86400 seconds)
        const validFor = 86400;

        console.log(`Creating ZK privacy proof for license ${licenseId}...`);
        const tx = await contract.createPrivacyProof(licenseId, proofHash, validFor);
        const receipt = await tx.wait();

        res.status(201).json({
            message: 'Privacy proof created on-chain. Share only the proofHash — no license data is revealed.',
            proofHash,
            nonce,
            validForSeconds: validFor,
            txHash: receipt.hash
        });

    } catch (err) {
        console.error("ZK proof creation error:", err.reason || err.message);
        res.status(500).json({ error: 'Failed to create privacy proof: ' + (err.reason || err.message) });
    }
});


// 8. VERIFY PRIVACY PROOF (Public — anyone can verify)
router.get('/zk/verify/:proofHash', async (req, res) => {
    try {
        const { proofHash } = req.params;
        const contract = getContract();

        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        const result = await contract.verifyPrivacyProof(proofHash);

        const proofExists = result[0];
        const isValid = result[1];
        const licenseType = result[2];
        const proofValidUntil = Number(result[3]);

        if (!proofExists) {
            return res.status(404).json({
                verified: false,
                message: 'No privacy proof found for this hash.'
            });
        }

        res.json({
            verified: isValid,
            licenseType: isValid ? licenseType : 'REDACTED',
            proofExpiry: new Date(proofValidUntil * 1000).toISOString(),
            message: isValid
                ? `✅ VERIFIED — This entity holds a valid ${licenseType} license. No further details are disclosed.`
                : '❌ INVALID — The underlying license is no longer active or the proof has expired.'
        });

    } catch (err) {
        console.error("ZK proof verification error:", err.reason || err.message);
        res.status(500).json({ error: 'Failed to verify privacy proof: ' + (err.reason || err.message) });
    }
});


export default router;