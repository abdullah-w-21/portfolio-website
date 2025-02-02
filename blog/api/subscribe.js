// blog/api/subscribe.js
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to environment variables');
}

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await client.connect();
        const database = client.db('newsletter');
        const collection = database.collection('subscribers');

        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
            await client.close();
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        await collection.insertOne({
            email,
            subscribedAt: new Date()
        });

        await client.close();
        return res.status(200).json({ 
            message: 'Subscription successful',
            email: email
        });

    } catch (error) {
        console.error('Server error:', error);
        await client.close();
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}
