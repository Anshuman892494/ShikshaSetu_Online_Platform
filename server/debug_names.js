require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./src/models/Student');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const students = await Student.find({}, 'firstName lastName email name regNo');
        console.log('--- Student Data ---');
        students.forEach(s => {
            console.log(`Email: ${s.email}`);
            console.log(`First: "${s.firstName}"`);
            console.log(`Last: "${s.lastName}"`);
            console.log(`Virtual Name: "${s.name}"`);
            console.log(`ID: ${s._id}`);
            console.log('----------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

connectDB();
