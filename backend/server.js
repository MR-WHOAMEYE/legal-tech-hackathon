import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { initBlockchain } from './config/blockchain.js';
import authRoutes from './routes/auth.js';
import licenseRoutes from './routes/licenses.js';
import requestRoutes from './routes/requests.js';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blockchain_licenses';

// Rate limiting — prevent brute force and abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/requests', requestRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database and Blockchain Connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected to', MONGODB_URI);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Continuing without MongoDB - blockchain functionality will work');
    });

// Start server regardless of MongoDB connection
initBlockchain();

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless
export default app;