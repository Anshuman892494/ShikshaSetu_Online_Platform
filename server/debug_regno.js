const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('./src/models/Student');

const run = async () => {
    try {
        const envPath = path.join(__dirname, '.env');
        console.log('Reading .env from:', envPath);

        let mongoURI = '';
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            const envLines = envConfig.split('\n');
            for (const line of envLines) {
                if (line.startsWith('MONGODB_URI=')) {
                    mongoURI = line.split('=')[1].trim();
                    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
                    break;
                }
            }
        }

        if (!mongoURI) {
            console.error('MONGODB_URI not found in .env, trying default local');
            mongoURI = 'mongodb://localhost:27017/gaonpathshala';
        }

        console.log('Connecting to MongoDB:', mongoURI);
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        // Check indexes
        try {
            const indexes = await Student.collection.indexes();
            console.log('Indexes:', JSON.stringify(indexes, null, 2));
        } catch (e) {
            console.log('Could not fetch indexes:', e.message);
        }

        // Find students with problems
        const problematicStudents = await Student.find({
            $or: [{ regNo: null }, { regNo: { $exists: false } }, { regNo: "" }]
        });

        console.log(`Found ${problematicStudents.length} students with invalid regNo.`);

        for (const student of problematicStudents) {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            // Adding extra random to ensure uniqueness in tight loop
            const extra = Math.floor(Math.random() * 1000).toString();
            const newRegNo = `GP-${timestamp}${random}-${extra}`;

            console.log(`Fixing student ${student.email} (ID: ${student._id}) with new regNo: ${newRegNo}`);
            student.regNo = newRegNo;
            try {
                await student.save();
                console.log('Saved.');
            } catch (saveErr) {
                console.error('Failed to save student:', saveErr.message);
                // If duplicate key error on save, try again with different regNo?
            }
        }

        console.log('Finished fixing regNos.');

        // Check all students
        const allStudents = await Student.find({}, 'email regNo');
        console.log(`Total students in DB: ${allStudents.length}`);
        allStudents.forEach(s => {
            console.log(`- ${s.email}: ${s.regNo} (Type: ${typeof s.regNo})`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            console.log('Disconnecting...');
            await mongoose.disconnect();
            console.log('Disconnected.');
        }
    }
};

run();
