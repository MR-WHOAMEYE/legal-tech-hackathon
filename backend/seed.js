import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/register';

const users = [
    {
        email: 'demo-1@tk.com',
        password: '12345678',
        role: 'business',
        businessName: 'Demo Business 1 Pvt Ltd'
    },
    {
        email: 'demo-2@tk.com',
        password: '12345678',
        role: 'regulator'
    },
    {
        email: 'demo-3@tk.com',
        password: '12345678',
        role: 'business',
        businessName: 'Demo Business 3 LLC'
    }
];

async function seedUsers() {
    console.log('Starting to seed mock users...');
    for (const user of users) {
        try {
            const response = await axios.post(API_URL, user);
            console.log(`✅ Successfully created user: ${user.email} (${user.role}) - Wallet: ${response.data.walletAddress || 'Generated'}`);
        } catch (error) {
            if (error.response && error.response.data) {
                console.log(`❌ Failed to create user ${user.email}: ${error.response.data.error || JSON.stringify(error.response.data)}`);
            } else {
                console.log(`❌ Failed to connect to backend for ${user.email}: ${error.message}`);
            }
        }
    }
    console.log('Seeding complete.');
}

seedUsers();
