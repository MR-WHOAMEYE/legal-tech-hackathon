import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['regulator', 'business', 'verifier'],
        required: true,
    },
    walletAddress: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: function () { return this.role === 'business'; }
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);