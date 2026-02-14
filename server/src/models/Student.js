const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        unique: true,
        sparse: true
    },
    attendance: {
        type: [String], // Array of date strings (YYYY-MM-DD)
        default: []
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
// Virtual for name (User requested only First Name)
studentSchema.virtual('name').get(function () {
    return this.firstName;
});

module.exports = mongoose.model('Student', studentSchema);
