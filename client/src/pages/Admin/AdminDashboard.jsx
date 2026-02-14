import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminResults, getExams, deleteExam, updateExam, getAdminExams, getAllSessions, deleteSession, deleteResult, getAllStudents, deleteStudent, addStudent, addStudentsBulk, getStudentById, updateStudent, getStudentReportCards, getMonthlyLeaderboard } from '../../services/examApi';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import Clock from '../../components/Clock';
import { APP_NAME } from '../../utils/constants';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [reportCards, setReportCards] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState({ month: '', leaderboard: [] });
    const [expandedStudents, setExpandedStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Admin');
    const [activeTab, setActiveTab] = useState('exams'); // exams, results, sessions, students, reportcards, leaderboard
    const [filterDate, setFilterDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    // Student Form State
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showEditStudentModal, setShowEditStudentModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', phone: '', email: '', password: '' });
    const [editingStudent, setEditingStudent] = useState({ _id: '', name: '', phone: '', email: '', password: '' });
    const [bulkFile, setBulkFile] = useState(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resultsRes, examsRes, sessionsRes, studentsRes, reportCardsRes, leaderboardRes] = await Promise.all([
                getAdminResults(),
                getAdminExams(),
                getAllSessions(),
                getAllStudents(),
                getStudentReportCards(),
                getMonthlyLeaderboard()
            ]);
            setResults(resultsRes.data);
            setExams(examsRes.data);
            const sortedSessions = sessionsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setSessions(sortedSessions);
            setStudents(studentsRes.data);
            setReportCards(reportCardsRes.data);
            setLeaderboardData(leaderboardRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionStr = localStorage.getItem('admin_session');
        if (!sessionStr) {
            navigate('/admin/login');
        } else {
            const session = JSON.parse(sessionStr);
            setAdminName(session.name || 'Admin');
            fetchData();
        }
    }, [navigate]);

    const handleRefresh = () => {
        fetchData();
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone and may affect results.")) return;
        try {
            await deleteExam(id);
            setExams(exams.filter(e => e._id !== id));
        } catch (error) {
            alert("Failed to delete exam");
        }
    };

    const handleToggleVisibility = async (exam) => {
        try {
            const updatedExam = { ...exam, isHidden: !exam.isHidden };
            await updateExam(exam._id, updatedExam);
            setExams(exams.map(e => e._id === exam._id ? updatedExam : e));
        } catch (error) {
            alert("Failed to update exam visibility");
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Are you sure you want to delete this session? This will force logout the user.")) return;
        try {
            await deleteSession(id);
            setSessions(sessions.filter(s => s._id !== id));
        } catch (error) {
            alert("Failed to delete session");
        }
    };

    const handleDeleteResult = async (id) => {
        if (!window.confirm("Are you sure you want to delete this result? This cannot be undone.")) return;
        try {
            await deleteResult(id);
            setResults(results.filter(r => r._id !== id));
        } catch (error) {
            alert("Failed to delete result");
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await deleteStudent(id);
            setStudents(students.filter(s => s._id !== id));
        } catch (error) {
            alert("Failed to delete student");
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            // Split name into firstName and lastName
            const nameParts = newStudent.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

            const studentPayload = {
                firstName,
                lastName,
                phone: newStudent.phone,
                email: newStudent.email,
                password: newStudent.password
            };

            const res = await addStudent(studentPayload);
            setStudents([res.data, ...students]);
            setShowStudentModal(false);
            setNewStudent({ name: '', phone: '', email: '', password: '' });
            alert("Student added successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add student");
        }
    };

    const handleEditStudent = async (studentId) => {
        try {
            const res = await getStudentById(studentId);
            setEditingStudent({ ...res.data, password: '' }); // Don't pre-fill password
            setShowEditStudentModal(true);
        } catch (error) {
            alert("Failed to load student details");
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            // Only include password in update if it's been changed
            const updateData = {
                name: editingStudent.name,
                phone: editingStudent.phone,
                email: editingStudent.email
            };
            if (editingStudent.password) {
                updateData.password = editingStudent.password;
            }

            const res = await updateStudent(editingStudent._id, updateData);
            setStudents(students.map(s => s._id === editingStudent._id ? res.data : s));
            setShowEditStudentModal(false);
            setEditingStudent({ _id: '', name: '', phone: '', email: '', password: '' });
            alert("Student updated successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update student");
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) return alert("Please select a file");

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Map columns if necessary (User provided: regNo, name, phone, password)
                // Assuming the excel/csv headers match the keys or are close
                const formattedData = data.map(item => {
                    const fullName = item.name || item['Name'] || item['Student Name'] || '';
                    const nameParts = fullName.trim().split(' ');
                    const firstName = nameParts[0];
                    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

                    return {
                        firstName,
                        lastName,
                        phone: item.phone || item['Phone'] || item['Mobile'],
                        password: item.password || item['Password'],
                        email: item.email || item['Email']
                    };
                });

                const res = await addStudentsBulk({ students: formattedData });
                alert(`${res.data.results.added} students added. ${res.data.results.failed} failed.`);
                if (res.data.results.errors.length > 0) {
                    console.log("Bulk upload errors:", res.data.results.errors);
                    alert("Check console for details on failed entries.");
                }

                // Refresh list
                const studentsRes = await getAllStudents();
                setStudents(studentsRes.data);
                setBulkFile(null);

            } catch (error) {
                console.error(error);
                alert("Failed to process file");
            }
        };
        reader.readAsBinaryString(bulkFile);
    };

    const getFilteredResults = () => {
        if (!filterDate) return results;
        return results.filter(result => {
            const resultDate = new Date(result.updatedAt || result.createdAt).toISOString().split('T')[0];
            return resultDate === filterDate;
        });
    };

    const getFilteredStudents = () => {
        if (!studentSearchQuery) return students;
        const query = studentSearchQuery.toLowerCase();
        return students.filter(student =>
            student.name?.toLowerCase().includes(query) ||
            student.phone?.toString().toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query)
        );
    };

    const handleExportExcel = () => {
        const filteredData = getFilteredResults();
        const worksheetData = filteredData.map(result => ({
            "Student Name": result.studentId ? result.studentId.name : 'Unknown',
            "Exam Title": result.examTitle,
            "Score": result.score,
            "Total Questions": result.totalQuestions,
            "Percentage": ((result.score / result.totalQuestions) * 100).toFixed(2) + '%',
            "Date": new Date(result.createdAt).toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
        XLSX.writeFile(workbook, `exam_results_${filterDate || 'all'}.xlsx`);
    };

    const toggleStudentExpand = (studentId) => {
        setExpandedStudents(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 75) return 'text-green-400';
        if (percentage >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getPerformanceBadge = (percentage) => {
        if (percentage >= 75) return <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-200">Excellent</span>;
        if (percentage >= 50) return <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-200">Good</span>;
        return <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-200">Needs Improvement</span>;
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <nav className="bg-gray-800 shadow-lg px-8 py-5 flex justify-between items-center fixed top-0 left-0 right-0 z-10 h-20 text-white border-b border-gray-700">
                <div className="flex items-center space-x-6">
                    <span className="text-2xl font-bold text-red-600 tracking-tighter">{APP_NAME} <span className="text-white"> Setu</span></span>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white tracking-tight leading-tight">{adminName}</span>
                        <span className="text-red-500 text-[10px] uppercase font-black tracking-widest leading-none">Administrator</span>
                    </div>
                </div>
                <div className="flex space-x-4 items-center">
                    <div className="flex items-center">
                        <div className="hidden md:flex items-center text-gray-400 text-sm font-medium bg-gray-700/50 px-4 py-2 rounded-full border border-gray-600/50">
                            <span className="material-symbols-outlined text-sm mr-2">calendar_month</span>
                            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <Clock />
                    </div>
                    <button onClick={handleRefresh} className="bg-gray-600 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-transform hover:scale-105 flex items-center">
                        <span className="material-symbols-outlined mr-2">refresh</span>
                        Refresh
                    </button>
                    <Link to="/admin/create-exam" className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-transform hover:scale-105 flex items-center">
                        <span className="material-symbols-outlined mr-2">add</span>
                        Create Exam
                    </Link>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to logout?")) {
                                localStorage.removeItem('admin_session');
                                navigate('/admin/login');
                            }
                        }}
                        className="text-red-400 hover:text-red-300 ml-4 font-medium px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-900/20 transition-colors flex items-center"
                    >
                        <span className="material-symbols-outlined mr-2">logout</span>
                        Log Out
                    </button>
                </div>
            </nav>

            <main className="pt-24 p-8 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-700 pb-2">
                    <button onClick={() => setActiveTab('exams')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'exams' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Manage Exams
                        {activeTab === 'exams' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                    <button onClick={() => setActiveTab('results')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'results' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Student Results
                        {activeTab === 'results' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                    <button onClick={() => setActiveTab('students')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'students' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Manage Students
                        {activeTab === 'students' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                    <button onClick={() => setActiveTab('reportcards')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'reportcards' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Report Cards
                        {activeTab === 'reportcards' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                    <button onClick={() => setActiveTab('leaderboard')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'leaderboard' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Leaderboard
                        {activeTab === 'leaderboard' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                    <button onClick={() => setActiveTab('sessions')} className={`pb-2 px-4 text-lg font-medium transition-colors relative ${activeTab === 'sessions' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
                        Active Sessions
                        {activeTab === 'sessions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'exams' && (
                    <div className="mb-12 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                            <span className="material-symbols-outlined mr-2">library_books</span>
                            Manage Exams
                        </h2>
                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[250px]">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Questions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security Key</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time Limit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ended Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {exams.map((exam) => (
                                        <tr key={exam._id} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{exam.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{exam.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-bold text-center">{exam.totalQuestions || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                                {exam.securityKey ? <span className="bg-gray-700 px-2 py-1 rounded text-xs select-all text-yellow-500 border border-yellow-500/30">{exam.securityKey}</span> : <span className="text-gray-600 italic">None</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{exam.timeLimitMinutes} mins</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{exam.endTime ? new Date(exam.endTime).toLocaleString() : 'Always Available'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {(() => {
                                                    const now = new Date();
                                                    const isExpired = exam.endTime && new Date(exam.endTime) < now;
                                                    if (isExpired) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900 text-orange-200">Expired</span>;
                                                    return exam.isHidden ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-200">Hidden</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">Visible</span>;
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                                                <button onClick={() => handleToggleVisibility(exam)} className={`mr-4 flex items-center transition-colors ${exam.isHidden ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'}`} title={exam.isHidden ? "Show Exam" : "Hide Exam"}>
                                                    <span className="material-symbols-outlined mr-1">{exam.isHidden ? 'visibility' : 'visibility_off'}</span>{exam.isHidden ? 'Show' : 'Hide'}
                                                </button>
                                                <Link to={`/admin/edit-exam/${exam._id}`} className="text-blue-400 hover:text-blue-300 mr-4 flex items-center transition-colors">
                                                    <span className="material-symbols-outlined mr-1">edit</span>Edit
                                                </Link>
                                                <button onClick={() => handleDeleteExam(exam._id)} className="text-red-400 hover:text-red-300 flex items-center transition-colors">
                                                    <span className="material-symbols-outlined mr-1">delete</span>Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {exams.length === 0 && <tr><td colSpan="8" className="px-6 py-4 text-center text-gray-500">No exams found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                                <span className="material-symbols-outlined mr-2">leaderboard</span>
                                Student Results
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
                                    <span className="material-symbols-outlined text-gray-400 mr-2">filter_alt</span>
                                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent text-white focus:outline-none text-sm" />
                                    <button onClick={() => setFilterDate('')} className="ml-2 text-gray-500 hover:text-white" title="Clear Filter">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                                <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow transition-colors flex items-center">
                                    <span className="material-symbols-outlined mr-2">file_download</span>Export Excel
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exam Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {getFilteredResults().map((result) => (
                                        <tr key={result._id} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{result.studentId ? result.studentId.name : 'Unknown User'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{result.examTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{result.score}/{result.totalQuestions}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.updatedAt || result.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-3">
                                                <Link to={`/admin/result/${result._id}`} className="text-blue-400 hover:text-blue-300 flex items-center transition-colors" title="View Result">
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </Link>
                                                <button onClick={() => handleDeleteResult(result._id)} className="text-red-400 hover:text-red-300 flex items-center transition-colors" title="Delete Result">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {getFilteredResults().length === 0 && <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No results found for this date.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                                <span className="material-symbols-outlined mr-2">groups</span>
                                Manage Students
                            </h2>
                            <div className="flex items-center gap-4">
                                {/* Search Input */}
                                <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
                                    <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                                    <input
                                        type="text"
                                        value={studentSearchQuery}
                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                        className="bg-transparent text-white focus:outline-none text-sm w-48"
                                        placeholder="Search students..."
                                    />
                                    {studentSearchQuery && (
                                        <button onClick={() => setStudentSearchQuery('')} className="ml-2 text-gray-500 hover:text-white" title="Clear Search">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => setShowStudentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition-colors flex items-center">
                                    <span className="material-symbols-outlined mr-2">person_add</span>
                                    Add Student
                                </button>

                                <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
                                    <span className="material-symbols-outlined text-gray-400 mr-2">upload_file</span>
                                    <input type="file" accept=".csv, .xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} className="text-sm text-gray-400 w-48" />
                                    <button onClick={handleBulkUpload} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded ml-2 text-sm">Upload</button>
                                </div>
                            </div>

                        </div>

                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {getFilteredStudents().map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.phone || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.email || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(student.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-3">
                                                <button onClick={() => handleEditStudent(student._id)} className="text-blue-400 hover:text-blue-300 flex items-center transition-colors" title="Edit Student">
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteStudent(student._id)} className="text-red-400 hover:text-red-300 flex items-center transition-colors" title="Delete Student">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {getFilteredStudents().length === 0 && students.length > 0 && (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No students match your search.</td></tr>
                                    )}
                                    {students.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No students found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bulk Upload Hint */}
                        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-2 mt-4 text-xs">
                            <p className="text-gray-400 mb-1">
                                <span className="font-semibold text-gray-300">Excel:</span> name | phone | email | password
                            </p>
                            <p className="text-gray-500 font-mono">
                                <span className="text-gray-400">Example:</span> Anshu | 9876543210 | anshu@example.com | pass123
                            </p>
                        </div>

                        {/* Add Student Modal */}
                        {showStudentModal && (
                            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-2xl border border-gray-700">
                                    <h3 className="text-xl font-bold mb-4 text-white">Add New Student</h3>
                                    <form onSubmit={handleAddStudent} className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                                            <input type="text" required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Name" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Phone</label>
                                            <input type="text" value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Phone" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Email</label>
                                            <input type="email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Email" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Password</label>
                                            <input type="text" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Password" />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-6">
                                            <button type="button" onClick={() => setShowStudentModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Add Student</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Edit Student Modal */}
                        {showEditStudentModal && (
                            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-2xl border border-gray-700">
                                    <h3 className="text-xl font-bold mb-4 text-white">Edit Student</h3>
                                    <form onSubmit={handleUpdateStudent} className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                                            <input type="text" required value={editingStudent.name} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Name" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Phone</label>
                                            <input type="text" value={editingStudent.phone || ''} onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Phone" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Email</label>
                                            <input type="email" value={editingStudent.email || ''} onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Email" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Password (leave blank to keep current)</label>
                                            <input type="text" value={editingStudent.password} onChange={e => setEditingStudent({ ...editingStudent, password: e.target.value })} className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter new password" />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-6">
                                            <button type="button" onClick={() => setShowEditStudentModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Update Student</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reportcards' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                            <span className="material-symbols-outlined mr-2">assessment</span>
                            Student Report Cards
                        </h2>
                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exams Taken</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Questions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Correct</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wrong</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Overall Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Average %</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Performance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {reportCards.map((report) => (
                                        <React.Fragment key={report.studentId}>
                                            <tr className="hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{report.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-bold text-center">{report.totalExams}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">{report.totalQuestions}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold text-center">{report.totalCorrect}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-bold text-center">{report.totalWrong}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">{report.totalScore}/{report.totalQuestions}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getPerformanceColor(report.averagePercentage)}`}>
                                                    {report.averagePercentage}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {getPerformanceBadge(report.averagePercentage)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {report.totalExams > 0 ? (
                                                        <button
                                                            onClick={() => toggleStudentExpand(report.studentId)}
                                                            className="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined">
                                                                {expandedStudents[report.studentId] ? 'expand_less' : 'expand_more'}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedStudents[report.studentId] && report.examDetails.length > 0 && (
                                                <tr className="bg-gray-900/50">
                                                    <td colSpan="10" className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-bold text-gray-300 mb-3">Exam-by-Exam Breakdown:</h4>
                                                            <div className="space-y-2">
                                                                {report.examDetails.map((exam, idx) => (
                                                                    <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between items-center">
                                                                        <div className="flex-1">
                                                                            <span className="text-white font-medium">{exam.examTitle}</span>
                                                                            <span className="text-gray-500 text-xs ml-3">{new Date(exam.date).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm">
                                                                            <span className="text-gray-400">Questions: <span className="text-white font-bold">{exam.totalQuestions}</span></span>
                                                                            <span className="text-green-400">✓ {exam.correct}</span>
                                                                            <span className="text-red-400">✗ {exam.wrong}</span>
                                                                            <span className="text-yellow-400 font-bold">Score: {exam.score}/{exam.totalQuestions}</span>
                                                                            <span className={`font-bold ${getPerformanceColor(exam.percentage)}`}>
                                                                                {exam.percentage}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {reportCards.length === 0 && (
                                        <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500">No student data available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                            <span className="material-symbols-outlined mr-2">group</span>
                            Active Sessions
                        </h2>
                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Started At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expires At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {sessions.map((session) => (
                                        <tr key={session._id} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{session.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(session.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(session.expiresAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleDeleteSession(session._id)} className="text-red-400 hover:text-red-300 flex items-center transition-colors">
                                                    <span className="material-symbols-outlined mr-1">delete</span>Terminate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sessions.length === 0 && <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No active sessions.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                                <span className="material-symbols-outlined mr-2 text-white">emoji_events</span>
                                All-Time Leaderboard
                            </h2>
                        </div>

                        {/* Full Rankings Table */}
                        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exams Taken</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Questions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Correct</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Average %</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {leaderboardData.leaderboard.map((student, index) => (
                                        <tr key={student.studentId} className={`hover:bg-gray-750 transition-colors ${index < 3 ? 'bg-gray-900/30' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                {student.rank === 1 && <span className="text-2xl">🥇</span>}
                                                {student.rank === 2 && <span className="text-2xl">🥈</span>}
                                                {student.rank === 3 && <span className="text-2xl">🥉</span>}
                                                {student.rank > 3 && <span className="text-gray-400">#{student.rank}</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-bold text-center">{student.totalExams}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">{student.totalQuestions}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold text-center">{student.totalCorrect}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">{student.totalScore}/{student.totalQuestions}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getPerformanceColor(student.averagePercentage)}`}>
                                                {student.averagePercentage}%
                                            </td>
                                        </tr>
                                    ))}
                                    {leaderboardData.leaderboard.length === 0 && (
                                        <tr><td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                            No exam results for this month yet. Students need to take exams to appear on the leaderboard!
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
