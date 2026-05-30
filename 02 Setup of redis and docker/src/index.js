import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get('/redis', async (req, res) => {
    const reply = await redis.ping();
    res.json({ redis: reply });
});

app.get('/mongo', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/mongodb');
        res.json({ mongo: 'connected', database: mongoose.connection.name });
    } catch (error) {
        res.status(500).json({ mongo: 'error', error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});