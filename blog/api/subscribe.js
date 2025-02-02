// blog/api/subscribe.js
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Path to emails.json in /tmp for Vercel
        const filePath = path.join('/tmp', 'emails.json');

        // Read existing emails
        let emails = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            emails = JSON.parse(fileContent);
        } catch (error) {
            // If file doesn't exist or is invalid, start with empty array
            console.log('Initial read error (expected if first run):', error.message);
            emails = [];
        }

        // Check if email already exists
        if (emails.includes(email)) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add new email
        emails.push(email);

        // Save updated emails
        await fs.writeFile(filePath, JSON.stringify(emails, null, 2));

        return res.status(200).json({ 
            message: 'Subscription successful',
            email: email
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}
