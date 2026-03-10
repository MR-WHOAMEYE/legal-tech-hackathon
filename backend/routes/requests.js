import express from 'express';
import { ethers } from 'ethers';
import { getContract } from '../config/blockchain.js';
import { auth, requireRole } from '../middleware/auth.js';
import { LicenseRequest } from '../models/LicenseRequest.js';

const router = express.Router();

// 1. CREATE LICENSE REQUEST (Business Only)
router.post('/', [auth, requireRole('business')], async (req, res) => {
    try {
        let { licenseType, businessName, licenseId, documentHash, walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress is required' });
        }

        if (walletAddress && !walletAddress.startsWith('0x')) {
            walletAddress = '0x' + walletAddress;
        }

        const newRequest = new LicenseRequest({
            businessId: req.user.id,
            walletAddress,
            businessName,
            licenseType,
            licenseId: licenseId || '',
            documentHash
        });

        await newRequest.save();

        res.status(201).json({
            message: 'License request submitted successfully. Awaiting regulator approval.',
            request: newRequest
        });

    } catch (err) {
        console.error("License Request error:", err);
        res.status(500).json({ error: 'Failed to submit license request: ' + err.message });
    }
});

// 2. GET PENDING REQUESTS (Regulator Only)
router.get('/pending', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const pendingRequests = await LicenseRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({ requests: pendingRequests });
    } catch (err) {
        console.error("Fetch pending requests error:", err);
        res.status(500).json({ error: 'Failed to fetch pending requests: ' + err.message });
    }
});

// 3. GET MY REQUESTS (Business Only)
router.get('/my-requests', [auth, requireRole('business')], async (req, res) => {
    try {
        const requests = await LicenseRequest.find({ businessId: req.user.id }).sort({ createdAt: -1 });
        res.json({ requests });
    } catch (err) {
        console.error("Fetch my requests error:", err);
        res.status(500).json({ error: 'Failed to fetch your requests: ' + err.message });
    }
});

// 4. APPROVE & MINT LICENSE (Regulator Only)
router.post('/:requestId/approve', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { requestId } = req.params;
        const { expiryDate, licenseId } = req.body;

        if (!expiryDate || !licenseId) {
            return res.status(400).json({ error: 'expiryDate and licenseId are required for approval' });
        }

        const licenseRequest = await LicenseRequest.findById(requestId);
        if (!licenseRequest) {
            return res.status(404).json({ error: 'License request not found' });
        }

        if (licenseRequest.status !== 'pending') {
            return res.status(400).json({ error: 'This request has already been processed.' });
        }

        const contract = getContract();
        if (!contract) return res.status(500).json({ error: 'Blockchain contract not initialized' });

        console.log(`Approving and Minting license ${licenseId} on-chain for ${licenseRequest.businessName}...`);
        
        // Mint to Blockchain
        const tx = await contract.registerLicense(
            licenseId,
            licenseRequest.licenseType,
            licenseRequest.businessName,
            licenseRequest.walletAddress,
            Math.floor(new Date(expiryDate).getTime() / 1000),
            licenseRequest.documentHash
        );

        const receipt = await tx.wait();

        // Update DB
        licenseRequest.status = 'approved';
        licenseRequest.licenseId = licenseId; // Update DB record if regulator provided it
        await licenseRequest.save();

        res.status(200).json({
            message: 'License approved and minted successfully on the blockchain',
            txHash: receipt.hash,
            licenseId
        });

    } catch (err) {
        console.error("License approval error:", err);
        res.status(500).json({ error: 'Failed to approve license on blockchain: ' + (err.reason || err.message) });
    }
});

// 5. REJECT LICENSE (Regulator Only)
router.post('/:requestId/reject', [auth, requireRole('regulator')], async (req, res) => {
    try {
        const { requestId } = req.params;
        const licenseRequest = await LicenseRequest.findById(requestId);
        
        if (!licenseRequest) {
            return res.status(404).json({ error: 'License request not found' });
        }

        licenseRequest.status = 'rejected';
        await licenseRequest.save();

        res.status(200).json({ message: 'License request rejected' });
    } catch (err) {
        console.error("License rejection error:", err);
        res.status(500).json({ error: 'Failed to reject license request: ' + err.message });
    }
});

export default router;
