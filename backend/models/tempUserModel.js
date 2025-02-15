import mongoose from 'mongoose';

const TempUserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true 
    },
    verificationCode: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 600 // Auto-delete after 10 minutes
    } 
});

export const TempUser = mongoose.model('TempUser', TempUserSchema);
