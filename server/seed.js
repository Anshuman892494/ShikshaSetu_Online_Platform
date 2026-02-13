const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/db');

dotenv.config();

const admins = [
    {
        name: 'admin',
        password: '123',
        phone: '1234567890'
    },
    // Add more admins here if needed
];

const seedAdmin = async () => {
    try {
        await connectDB();

        // No longer deleting all admins
        // await Admin.deleteMany({});
        // ganesh lokhande 

        for (const adminData of admins) {
            const existingAdmin = await Admin.findOne({ phone: adminData.phone });

            if (existingAdmin) {
                console.log(`Admin with phone ${adminData.phone} already exists. Skipping.`);
            } else {
                await Admin.create(adminData);
                console.log(`Admin ${adminData.name} added successfully.`);
            }
        }

        console.log('Admin seeding process completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
