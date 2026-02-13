import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { getStudentById, getUserResults, getLeaderboard, getStudentStats } from '../services/examApi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

const Progress = () => {
    const [userData, setUserData] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [stats, setStats] = useState({
        rank: 'NR',
        avgScore: 0,
        totalExams: 0,
        monthlyAttendance: 0,
        yearlyAttendance: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const sessionStr = localStorage.getItem('session');
        if (!sessionStr) return;
        const session = JSON.parse(sessionStr);
        const studentId = session.studentId || session._id;

        try {
            const { data: student } = await getStudentById(studentId);
            setUserData(student);

            const { data: results } = await getUserResults(studentId);
            setExamResults(results || []);

            const { data: statsData } = await getStudentStats(studentId);
            if (statsData && statsData.stats) {
                setStats(statsData.stats);
            }

        } catch (error) {
            console.error('Failed to fetch progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Prepare chart data
    const performanceData = useMemo(() => {
        return [...examResults]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(r => ({
                name: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                score: r.percentage
            }));
    }, [examResults]);

    const attendanceData = useMemo(() => {
        if (!userData?.attendance) return [];
        const monthlyCounts = {};
        userData.attendance.forEach(date => {
            const [y, m] = date.split('-');
            const key = `${new Date(y, m - 1).toLocaleString('default', { month: 'short' })} ${y}`;
            monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        });

        return Object.entries(monthlyCounts).map(([month, count]) => ({
            month,
            days: count
        })).slice(-6); // Last 6 months
    }, [userData]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex font-sans selection:bg-green-500/30 selection:text-green-400">
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-10 mt-20 max-w-[1400px] mx-auto w-full relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-900/05 rounded-full blur-[120px] z-0 pointer-events-none"></div>

                    <div className="relative z-10 space-y-10">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-800/50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Analytics Dashboard</h1>
                                </div>
                                <p className="text-gray-400 text-sm font-medium tracking-wide ml-4">Analyze your academic journey and performance metrics.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 px-6 py-3 rounded-2xl">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Standing</p>
                                    <p className="text-xl font-black text-green-500">Rank #{stats.rank}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Average Score", value: `${stats.averageScore}%`, icon: "analytics", color: "text-blue-400", bg: "bg-blue-400/10" },
                                { title: "Exams Attempted", value: stats.examsAttempted, icon: "history_edu", color: "text-purple-400", bg: "bg-purple-400/10" },
                                { title: "Monthly Attendance", value: `${stats.monthlyAttendance}%`, icon: "calendar_today", color: "text-orange-400", bg: "bg-orange-400/10" },
                                { title: "Total Points", value: stats.totalPoints, icon: "stars", color: "text-yellow-400", bg: "bg-yellow-400/10" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-gray-800/30 border border-gray-700/50 p-6 rounded-3xl hover:border-green-500/30 transition-all group overflow-hidden relative">
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.title}</p>
                                            <p className="text-2xl font-black text-white">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center border border-white/5`}>
                                            <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Graphs Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Performance Line Chart */}
                            <div className="bg-gray-800/20 backdrop-blur-md border border-gray-800/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Performance Trend</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score progress over time</p>
                                    </div>
                                    <span className="material-symbols-outlined text-blue-400 bg-blue-400/10 p-2 rounded-xl">show_chart</span>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#9CA3AF"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="#9CA3AF"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px' }}
                                                itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3B82F6"
                                                strokeWidth={4}
                                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#1F2937' }}
                                                activeDot={{ r: 6, stroke: '#1F2937', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Attendance Bar Chart */}
                            <div className="bg-gray-800/20 backdrop-blur-md border border-gray-800/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Attendance Stability</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active days per month</p>
                                    </div>
                                    <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-2 rounded-xl">bar_chart</span>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#9CA3AF"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="#9CA3AF"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px' }}
                                                itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="days" fill="#10B981" radius={[6, 6, 0, 0]}>
                                                {attendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === attendanceData.length - 1 ? '#22C55E' : '#10B981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent Results List */}
                        <div className="bg-gray-800/10 border border-gray-800/50 rounded-[2.5rem] p-8 mt-10">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500">history</span>
                                Detailed History
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {examResults.length > 0 ? (
                                    examResults.map((result, i) => (
                                        <div key={i} className="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl hover:bg-gray-800/60 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800 group-hover:scale-110 transition-transform">
                                                        <span className="text-xs font-black text-green-500">{result.percentage}%</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{result.examName || 'Exam Result'}</h4>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                                                            {new Date(result.createdAt).toLocaleDateString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${result.percentage >= 50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {result.percentage >= 50 ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-2xl border border-gray-800">
                                                <div className="text-center flex-1">
                                                    <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Score</p>
                                                    <p className="text-xs font-black text-white">{result.score}/{result.totalPossibleScore || result.totalQuestions * 2 || 100}</p>
                                                </div>
                                                <div className="w-[1px] h-6 bg-gray-800"></div>
                                                <div className="text-center flex-1">
                                                    <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Rank</p>
                                                    <p className="text-xs font-black text-blue-400">#{i + 1}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-gray-800/20 border border-dashed border-gray-800 rounded-[2.5rem]">
                                        <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">assignment_late</span>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest">No stats available yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Progress;
