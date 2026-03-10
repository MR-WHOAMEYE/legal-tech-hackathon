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
        const { email, password, role, businessName } = req.body;

        if (!email || !password || !role || !isValidRole(role)) {
            return res.status(400).json({ error: 'Missing or invalid fields (email, password, role)' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate a valid Ethereum wallet address for the user (we don't give them the private key here,
        // it's just for their identity on the platform/chain).
        // For regulators, we can assign a known Hardhat account if needed, but random is fine for POC.
        const randomWallet = ethers.Wallet.createRandom();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            walletAddress: randomWallet.address,
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

export default router;