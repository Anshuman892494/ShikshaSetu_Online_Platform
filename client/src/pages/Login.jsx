import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentLogin, resetStudentPassword, verifyStudentDetails } from '../services/examApi';
import { APP_NAME, APP_VERSION } from '../utils/constants';

const Login = () => {

    // Student State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Verify, 2: Reset
    const [forgotData, setForgotData] = useState({ firstName: '', lastName: '', email: '', phone: '', newPassword: '' });
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError('');

        try {
            await verifyStudentDetails({
                firstName: forgotData.firstName,
                lastName: forgotData.lastName,
                email: forgotData.email,
                phone: forgotData.phone
            });
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Verification failed. Check your details.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError('');

        try {
            const { data } = await resetStudentPassword(forgotData);
            setForgotSuccess(data.message);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setForgotLoading(false);
        }
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [existingSession, setExistingSession] = useState(null);

    // Check for existing session but DO NOT auto-greenirect
    React.useEffect(() => {
        const sessionStr = localStorage.getItem('session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (new Date(session.expiresAt) > new Date()) {
                setExistingSession(session);
            } else {
                localStorage.removeItem('session');
            }
        }
    }, []);



    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Dynamic imports removed as they are already importegreen at the top
            const { data } = await studentLogin(email, password);

            localStorage.setItem('session', JSON.stringify({
                sessionId: data.sessionId,
                userId: data.userId, // Kept for compatibility
                studentId: data.studentId,
                name: data.name,
                email: data.email,
                expiresAt: data.expiresAt,
                type: 'student'
            }));

            navigate('/home', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check RegNo or Password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full max-w-6xl">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600 mb-4 tracking-tight drop-shadow-sm filter">
                        {APP_NAME} <span className="text-gray-100">Setu</span>
                    </h1>
                    <div className="h-1 w-24 bg-green-600 mx-auto rounded-full mb-10"></div>
                </div>

                {/* Login Form */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-10 w-full max-w-md mx-auto border border-gray-700 relative overflow-hidden group">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Student Login</h2>

                    {existingSession && (
                        <div className="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-xl flex items-center justify-between">
                            <div className="text-sm">
                                <p className="text-gray-400">Logged in as:</p>
                                <p className="text-gray-200 font-semibold">{existingSession.name}</p>
                            </div>
                            <Link to="/home" className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors">
                                Continue
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="bg-green-900/20 text-green-400 p-4 rounded-lg mb-6 text-sm border border-green-500/20 flex items-start">
                            <span className="material-symbols-outlined mr-2 text-lg">warning</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleStudentSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-500 transition-all"
                                    placeholder="Enter Email"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-3.5 text-gray-400">mail</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-500 transition-all"
                                    placeholder="Enter Password"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-3.5 text-gray-400">lock</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg cursor-pointer shadow-green-900/20 transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Logging in...' : 'Student Login'}
                        </button>
                    </form>

                    <div className="mt-2 flex justify-between items-center text-sm">
                        <Link
                            to="/register"
                            className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
                        >
                            Create an account
                        </Link>
                        <button
                            onClick={() => setShowForgotModal(true)}
                            className="text-green-400 hover:text-green-300 font-medium cursor-pointer transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-700/50">
                        <Link to="/admin/login" className="text-gray-500 hover:text-gray-300 font-medium transition-colors hover:underline">
                            Admin Access
                        </Link>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl relative">
                        <button
                            onClick={() => {
                                setShowForgotModal(false);
                                setForgotStep(1);
                                setForgotError('');
                                setForgotSuccess('');
                                setForgotData({ firstName: '', lastName: '', email: '', phone: '', newPassword: '' });
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            {forgotStep === 1 ? 'Verify Identity' : 'Reset Password'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {forgotStep === 1
                                ? 'Enter your details to verify your identity.'
                                : 'Identity verified. Please set a new password.'}
                        </p>

                        {forgotError && (
                            <div className="bg-green-900/20 text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/20">
                                {forgotError}
                            </div>
                        )}

                        {forgotSuccess && (
                            <div className="bg-green-900/20 text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/20">
                                {forgotSuccess}
                            </div>
                        )}

                        {!forgotSuccess ? (
                            <form onSubmit={forgotStep === 1 ? handleVerifySubmit : handleResetSubmit} className="space-y-4">
                                {forgotStep === 1 ? (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-gray-400 text-sm mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={forgotData.firstName}
                                                    onChange={e => setForgotData({ ...forgotData, firstName: e.target.value })}
                                                    className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                                    placeholder="First Name"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-gray-400 text-sm mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={forgotData.lastName}
                                                    onChange={e => setForgotData({ ...forgotData, lastName: e.target.value })}
                                                    className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                                    placeholder="Last Name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={forgotData.email}
                                                onChange={e => setForgotData({ ...forgotData, email: e.target.value })}
                                                className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Enter registered email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={forgotData.phone}
                                                onChange={e => setForgotData({ ...forgotData, phone: e.target.value })}
                                                className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Enter registered phone number"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-1">New Password</label>
                                        <input
                                            type="text"
                                            required
                                            value={forgotData.newPassword}
                                            onChange={e => setForgotData({ ...forgotData, newPassword: e.target.value })}
                                            className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                                >
                                    {forgotLoading ? 'Processing...' : (forgotStep === 1 ? 'Verify Details' : 'Reset Password')}
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setForgotSuccess('');
                                    setForgotStep(1);
                                    setForgotData({ firstName: '', lastName: '', email: '', phone: '', newPassword: '' });
                                }}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Close & Login
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
