// blog/api/subscribe.js
const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Path to emails.json
        const filePath = path.join(process.cwd(), 'blog', 'data', 'emails.json');

        // Read existing emails
        let emails = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            emails = JSON.parse(fileContent);
        } catch (error) {
            // If file doesn't exist, we'll start with an empty array
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        // Check if email already exists
        if (emails.includes(email)) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add new email
        emails.push(email);

        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Save updated emails
        await fs.writeFile(filePath, JSON.stringify(emails, null, 2));

        return res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
