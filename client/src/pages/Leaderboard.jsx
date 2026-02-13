import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { getLeaderboard } from '../services/examApi';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStudent, setCurrentStudent] = useState(null);

    useEffect(() => {
        // Get current student's info from session
        const sessionStr = localStorage.getItem('session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            setCurrentStudent({
                name: session.name,
                regNo: session.regNo,
                studentId: session.studentId
            });
        }
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await getLeaderboard();
            setLeaderboardData(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    // Filter leaderboard: Top 10 + current student if not in top 10
    const getDisplayedLeaderboard = () => {
        if (!leaderboardData || !leaderboardData.leaderboard) return [];

        const fullList = leaderboardData.leaderboard;
        const top10 = fullList.slice(0, 10);

        // Check if current student is in top 10
        if (currentStudent) {
            const currentStudentInTop10 = top10.find(s => s.regNo === currentStudent.regNo);

            if (!currentStudentInTop10) {
                // Find current student in full list
                const currentStudentData = fullList.find(s => s.regNo === currentStudent.regNo);
                if (currentStudentData) {
                    // Return top 10 + separator + current student
                    return { top10, currentStudent: currentStudentData, showSeparator: true };
                }
            }
        }

        return { top10, currentStudent: null, showSeparator: false };
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />

                <main className="flex-1 p-8 bg-gray-900 mt-20">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-2">
                                <h1 className="text-4xl font-bold text-gray-100">Leaderboard</h1>
                            </div>
                            <p className="text-gray-400 max-w-2xl">
                                See where you stand!
                            </p>
                        </div>

                        {/* Leaderboard Table */}
                        {leaderboardData && leaderboardData.leaderboard.length > 0 ? (
                            <>
                                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Rank</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Exams</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Average</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {(() => {
                                                const { top10, currentStudent: myRank, showSeparator } = getDisplayedLeaderboard();

                                                return (
                                                    <>
                                                        {/* Top 10 Students */}
                                                        {top10.map((student) => {
                                                            const isTopThree = student.rank <= 3;
                                                            const isCurrentStudent = currentStudent && student.regNo === currentStudent.regNo;

                                                            return (
                                                                <tr
                                                                    key={student.studentId}
                                                                    className={`${isCurrentStudent
                                                                        ? 'bg-blue-900/30 border-l-4 border-blue-500'
                                                                        : isTopThree
                                                                            ? 'bg-gradient-to-r from-yellow-900/20 to-transparent'
                                                                            : 'hover:bg-gray-700/50'
                                                                        } transition-colors`}
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`text-2xl font-bold ${isTopThree ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                                            {getMedalIcon(student.rank)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="font-medium text-gray-200 flex items-center">
                                                                            {student.name}
                                                                            {isCurrentStudent && (
                                                                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">You</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                                                        {student.email}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center text-gray-300">{student.totalExams}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="font-semibold text-blue-400">{student.totalScore}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`text-lg font-bold ${student.averagePercentage >= 75 ? 'text-green-400' : student.averagePercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                                {student.averagePercentage}%
                                                                            </span>
                                                                            <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                                                                                <div
                                                                                    className={`h-2 rounded-full ${student.averagePercentage >= 75 ? 'bg-green-500' : student.averagePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                                    style={{ width: `${student.averagePercentage}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {/* Separator and Current Student's Rank (if not in top 10) */}
                                                        {showSeparator && myRank && (
                                                            <>
                                                                <tr className="bg-gray-900">
                                                                    <td colSpan="6" className="px-6 py-3 text-center text-gray-500 text-sm">
                                                                        <div className="flex items-center justify-center">
                                                                            <div className="flex-1 border-t border-gray-700"></div>
                                                                            <span className="px-4">• • •</span>
                                                                            <div className="flex-1 border-t border-gray-700"></div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr className="bg-blue-900/30 border-l-4 border-blue-500">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="text-2xl font-bold text-gray-400">
                                                                            {getMedalIcon(myRank.rank)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="font-medium text-gray-200 flex items-center">
                                                                            {myRank.name}
                                                                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">You</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                                                        {myRank.email}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center text-gray-300">{myRank.totalExams}</td>
                                                                    <td className="px-6 py-4 text-center text-gray-300">{myRank.totalQuestions}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="text-green-400 font-semibold">{myRank.totalCorrect}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="font-semibold text-blue-400">{myRank.totalScore}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`text-lg font-bold ${myRank.averagePercentage >= 75 ? 'text-green-400' : myRank.averagePercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                                {myRank.averagePercentage}%
                                                                            </span>
                                                                            <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                                                                                <div
                                                                                    className={`h-2 rounded-full ${myRank.averagePercentage >= 75 ? 'bg-green-500' : myRank.averagePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                                    style={{ width: `${myRank.averagePercentage}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                                <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 block">emoji_events</span>
                                <p className="text-gray-400 text-lg">No leaderboard data available yet</p>
                                <p className="text-gray-500 text-sm mt-2">Complete some exams to see your ranking!</p>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-start">
                                <span className="material-symbols-outlined text-blue-400 mr-3 mt-0.5">info</span>
                                <div className="text-sm text-gray-300">
                                    <p className="font-semibold text-blue-400 mb-1">How Rankings Work:</p>
                                    <ul className="text-gray-400 space-y-1">
                                        <li>• You can see the <strong>Top 10 students</strong> + your own ranking</li>
                                        <li>• Rankings based on <strong>average percentage</strong> across all exams</li>
                                        <li>• More exams and higher scores improve your ranking</li>
                                        <li>• Leaderboard updates automatically after each exam</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Leaderboard;
