const Result = require('../models/Result');
const Session = require('../models/Session');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// @desc    Admin Login
// @route   POST /api/admin/login
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if any admin exists, if not create a default one (for first-time setup)
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({
                name: 'admin',
                password: 'admin123', // This will be hashed by the pre-save hook
                phone: '0000000000'
            });
        }

        const admin = await Admin.findOne({ name: username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            name: admin.name,
            role: 'admin',
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password (Verify Phone)
// @route   POST /api/admin/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { phone } = req.body;
        const admin = await Admin.findOne({ phone });

        if (!admin) {
            return res.status(404).json({ message: 'Phone number not found' });
        }

        res.json({ message: 'Phone verified. You can now reset your password.', adminId: admin._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/admin/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { adminId, newPassword } = req.body;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.password = newPassword; // Will be hashed by pre-save hook
        await admin.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Results (Admin View)
// @route   GET /api/admin/results
exports.getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate('studentId', 'name regNo')
            .sort({ updatedAt: -1 });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Result
// @route   DELETE /api/admin/results/:id
exports.deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        await result.deleteOne();
        res.json({ message: 'Result removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Result (Admin View)
// @route   GET /api/admin/results/:id
exports.getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('studentId', 'name regNo')
            .populate('examId', 'securityEnabled')
            .populate('answers.questionId');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Report Cards (Aggregated Performance)
// @route   GET /api/admin/report-cards
exports.getStudentReportCards = async (req, res) => {
    try {
        const Student = require('../models/Student');

        // Get all students
        const students = await Student.find().select('-password').sort({ name: 1 });

        // For each student, aggregate their results
        const reportCards = await Promise.all(students.map(async (student) => {
            const results = await Result.find({ studentId: student._id })
                .sort({ createdAt: -1 });

            // Filter to keep only the best attempt for each unique exam
            const bestResultsMap = new Map();
            results.forEach(result => {
                const examId = result.examId.toString();
                const existing = bestResultsMap.get(examId);

                if (!existing) {
                    // First attempt for this exam
                    bestResultsMap.set(examId, result);
                } else {
                    // Compare scores, keep the better one
                    // If scores are equal, keep the most recent (already sorted by createdAt desc)
                    if (result.score > existing.score) {
                        bestResultsMap.set(examId, result);
                    }
                }
            });

            // Convert map to array of best results
            const filteredResults = Array.from(bestResultsMap.values());

            // Calculate aggregated metrics using only best attempts
            const totalExams = filteredResults.length;
            const totalQuestions = filteredResults.reduce((sum, r) => sum + r.totalQuestions, 0);
            const totalCorrect = filteredResults.reduce((sum, r) => sum + r.correct, 0);
            const totalWrong = filteredResults.reduce((sum, r) => sum + r.wrong, 0);
            const totalScore = filteredResults.reduce((sum, r) => sum + r.score, 0);
            const averagePercentage = totalQuestions > 0
                ? ((totalScore / totalQuestions) * 100).toFixed(2)
                : 0;

            // Prepare exam details using only best attempts
            const examDetails = filteredResults.map(r => ({
                examId: r.examId,
                examTitle: r.examTitle,
                totalQuestions: r.totalQuestions,
                correct: r.correct,
                wrong: r.wrong,
                score: r.score,
                percentage: ((r.score / r.totalQuestions) * 100).toFixed(2),
                date: r.createdAt
            }));

            return {
                studentId: student._id,
                name: student.name,
                regNo: student.regNo,
                phone: student.phone,
                email: student.email,
                totalExams,
                totalQuestions,
                totalCorrect,
                totalWrong,
                totalScore,
                averagePercentage: parseFloat(averagePercentage),
                examDetails
            };
        }));

        res.json(reportCards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All-Time Leaderboard (Top Performers)
// @route   GET /api/admin/leaderboard
exports.getMonthlyLeaderboard = async (req, res) => {
    try {
        const Student = require('../models/Student');

        // Get ALL results (no date filtering - all-time leaderboard)
        const allResults = await Result.find({});

        // Group by student and calculate performance
        const studentPerformance = {};

        for (const result of allResults) {
            const studentId = result.studentId.toString();

            if (!studentPerformance[studentId]) {
                studentPerformance[studentId] = {
                    studentId: result.studentId,
                    totalExams: 0,
                    totalQuestions: 0,
                    totalCorrect: 0,
                    totalWrong: 0,
                    totalScore: 0
                };
            }

            studentPerformance[studentId].totalExams++;
            studentPerformance[studentId].totalQuestions += result.totalQuestions;
            studentPerformance[studentId].totalCorrect += result.correct;
            studentPerformance[studentId].totalWrong += result.wrong;
            studentPerformance[studentId].totalScore += result.score;
        }

        // Convert to array and add student details
        const leaderboard = await Promise.all(
            Object.values(studentPerformance).map(async (perf) => {
                const student = await Student.findById(perf.studentId).select('-password');
                if (!student) return null;

                const averagePercentage = perf.totalQuestions > 0
                    ? ((perf.totalScore / perf.totalQuestions) * 100).toFixed(2)
                    : 0;

                const firstName = student.firstName || '';
                const lastName = student.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const displayName = fullName || student.email || 'Student';

                return {
                    studentId: student._id,
                    name: displayName,
                    regNo: student.regNo,
                    phone: student.phone,
                    email: student.email,
                    totalExams: perf.totalExams,
                    totalQuestions: perf.totalQuestions,
                    totalCorrect: perf.totalCorrect,
                    totalWrong: perf.totalWrong,
                    totalScore: perf.totalScore,
                    averagePercentage: parseFloat(averagePercentage)
                };
            })
        );

        // Filter out nulls and sort by average percentage (descending)
        const rankedLeaderboard = leaderboard
            .filter(entry => entry !== null)
            .sort((a, b) => b.averagePercentage - a.averagePercentage)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

        res.json({
            month: 'All Time', // All-time leaderboard instead of monthly
            leaderboard: rankedLeaderboard
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
