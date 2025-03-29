import mongoose from 'mongoose';

const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const MONGODB_URI = (process.env.DB_URI ?? '').replace('<db_password>', PASSWORD || '').replace('<db_username>', USERNAME || '');

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

async function connectDB() {
    try {
        mongoose.connect(MONGODB_URI);
    } catch(e) {
        throw e;
    }
}

export default connectDB;
