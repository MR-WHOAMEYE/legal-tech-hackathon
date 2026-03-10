import express from 'express';
import { getContract } from '../config/blockchain.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_only_123';

// Auth Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Role middleware
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Access denied. Required role: ' + role });
        }
        next();
    }
};


// 1. REGISTER LICENSE (Regulator Only)
router.post('/register', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { licenseId, licenseType, businessName, holderAddress, expiryDate, documentHash } = req.body;
        const contract = getContract();

        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        // Call the smart contract
        console.log(`Registering license ${licenseId} on-chain...`);
        const tx = await contract.registerLicense(
            licenseId,
            licenseType,
            businessName,
            holderAddress,
            Math.floor(new Date(expiryDate).getTime() / 1000), // convert to unix timestamp sec
            documentHash
        );

        // Wait for it to be mined
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

        // `data` is an array/proxy object from ethers. Format it:
        const license = {
            licenseId: data.licenseId,
            licenseType: data.licenseType,
            businessName: data.businessName,
            holderAddress: data.holderAddress,
            issuerAddress: data.issuerAddress,
            // ethers v6 returns BigInt for uint256
            issueDate: new Date(Number(data.issueDate) * 1000).toISOString(),
            expiryDate: new Date(Number(data.expiryDate) * 1000).toISOString(),
            status: Number(data.status), // 0: Active, 1: Suspended, 2: Revoked
            statusString: Number(data.status) === 0 ? 'Active' : (Number(data.status) === 1 ? 'Suspended' : 'Revoked'),
            documentHash: data.documentHash,
            isValid: Number(data.status) === 0 && (Number(data.expiryDate) * 1000) > Date.now()
        };

        res.json({ license });

    } catch (err) {
        console.error("License verification error:", err.reason || err.message);
        // If "License not found" require throws, we return 404
        if (err.message && err.message.includes('License not found')) {
            return res.status(404).json({ error: 'License not found on the blockchain' });
        }
        res.status(500).json({ error: 'Failed to verify license: ' + (err.reason || err.message) });
    }
});

// 3. REVOKE LICENSE (Regulator Only)
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

export default router;