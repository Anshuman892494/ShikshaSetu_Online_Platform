require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./src/models/Student');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const students = await Student.find({});
        console.log(`Found ${students.length} students. Checking for missing names...`);

        for (const s of students) {
            let updated = false;

            // If firstName is missing but we have name (from virtual? no, virtual isn't stored)
            // If firstName is missing, try to derive from email or set default
            if (!s.firstName || s.firstName.trim() === '') {
                console.log(`Fixing student ${s.email} (ID: ${s._id}) - Missing firstName`);

                // Try to use part of email as name
                const emailName = s.email.split('@')[0];
                s.firstName = emailName; // temporary fix
                if (!s.lastName) s.lastName = '.'; // dummy last name to satisfy required

                updated = true;
            } else {
                console.log(`Student ${s.email} has name: "${s.firstName}" "${s.lastName}"`);
            }

            if (updated) {
                // Bypass validation if needed, but better to satisfy it
                try {
                    await s.save({ validateBeforeSave: false }); // Force save
                    console.log(`-> Saved update for ${s.email}`);
                } catch (e) {
                    console.error(`-> Failed to save ${s.email}: ${e.message}`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

connectDB();
