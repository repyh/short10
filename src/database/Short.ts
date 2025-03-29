import { Schema, model, models } from 'mongoose';

const shortenedURLSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    targetURL: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

shortenedURLSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default models.Short || model('Short', shortenedURLSchema);