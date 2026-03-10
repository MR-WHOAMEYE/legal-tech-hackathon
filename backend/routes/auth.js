import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_only_123';

// Helper to validate role
const isValidRole = (role) => ['regulator', 'business', 'verifier'].includes(role);

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, businessName, walletAddress } = req.body;

        if (!email || !password || !role || !isValidRole(role)) {
            return res.status(400).json({ error: 'Missing or invalid fields (email, password, role)' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Use the provided wallet address from the frontend (if they connected MetaMask),
        // Otherwise, generate a random one for them as a fallback for the POC.
        let finalWalletAddress = walletAddress;
        if (!finalWalletAddress) {
            const randomWallet = ethers.Wallet.createRandom();
            finalWalletAddress = randomWallet.address;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            walletAddress: finalWalletAddress,
            businessName: role === 'business' ? businessName : undefined
        });

        await newUser.save();

        // Exclude password from response
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({ message: 'User registered successfully', user: userObj });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            walletAddress: user.walletAddress
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: payload
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// MetaMask / Web3 Wallet Login Endpoint
router.post('/login/wallet', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Missing walletAddress' });
        }

        // Ideally, in a real app, we'd verify a cryptographic signature here (EIP-4361).
        // For the hackathon POC, we'll just check if the wallet exists.
        // If it doesn't exist, we can create a default 'verifier' account for them.
        
        let user = await User.findOne({ walletAddress: new RegExp('^' + walletAddress + '$', 'i') });
        
        if (!user) {
            // Auto-register as verifier if wallet not found
            const newUser = new User({
                email: `${walletAddress.substring(0,8)}@wallet.local`, 
                password: await bcrypt.hash(walletAddress, 10), // Dummy password
                role: 'verifier',
                walletAddress: walletAddress.toLowerCase() // normalize
            });
            await newUser.save();
            user = newUser;
        }

        // Generate Token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            walletAddress: user.walletAddress
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: payload
        });

    } catch (err) {
        console.error("Wallet login error:", err);
        res.status(500).json({ error: 'Server error during wallet login' });
    }
});

export default router;