import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, forgotPassword, resetPassword } from '../../services/examApi';
import { APP_NAME } from '../../utils/constants';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Forgot Password State
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Phone, 2: Reset
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [adminId, setAdminId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { data } = await adminLogin({ username, password });
            localStorage.setItem('admin_session', JSON.stringify(data));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Cgreenentials');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (forgotStep === 1) {
                const { data } = await forgotPassword(phone);
                setAdminId(data.adminId);
                setForgotStep(2);
                setSuccess(data.message);
            } else {
                const { data } = await resetPassword(adminId, newPassword);
                setSuccess(data.message);
                setTimeout(() => {
                    setShowForgot(false);
                    setForgotStep(1);
                    setSuccess(null);
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-6">
            <div className="text-center">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text pt-5 bg-gradient-to-r from-green-500 to-green-600 mb-4 tracking-tight drop-shadow-sm filter">
                    {APP_NAME} <span className="text-white">Setu</span>
                </h1>
                <div className="h-1 w-24 bg-green-600 mx-auto rounded-full mb-4"></div>
                <p className="text-white text-2xl font-bold mb-10 ">Admin Portal</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
                    {showForgot ? 'Reset Password' : 'Login'}
                </h2>

                {error && <div className="bg-green-900/30 text-green-500 p-3 rounded-lg mb-4 text-sm border border-green-500/30">{error}</div>}
                {success && <div className="bg-green-900/30 text-green-500 p-3 rounded-lg mb-4 text-sm border border-green-500/30">{success}</div>}

                {!showForgot ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Admin Name</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                requigreen
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Enter name"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <button
                                    type="button"
                                    onClick={() => { setShowForgot(true); setError(null); setSuccess(null); }}
                                    className="text-xs text-green-500 hover:text-green-400 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                requigreen
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="text-center mt-6 border-t border-gray-700 pt-4">
                            <Link to="/login" className="text-sm text-green-500 hover:text-green-400 font-medium transition-colors">
                                Login as Student
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-6">
                        {forgotStep === 1 ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    requigreen
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Enter your registegreen phone"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    requigreen
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Enter new password"
                                />
                            </div>
                        )}

                        <div className="flex flex-col space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (forgotStep === 1 ? 'Verify Phone' : 'Reset Password')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForgot(false); setForgotStep(1); setError(null); setSuccess(null); }}
                                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;
