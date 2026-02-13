import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, APP_VERSION } from '../utils/constants';

const Sidebar = () => {
    const location = useLocation();

    const session = JSON.parse(localStorage.getItem('session') || '{}');

    const isActive = (path) => {
        return location.pathname === path ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100';
    };

    return (
        <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 z-20 shadow-xl flex flex-col border-r border-gray-800">
            <div className="h-20 flex items-center px-8 border-b border-gray-800 bg-gray-900">
                <span className="text-2xl font-bold text-green-600 tracking-tighter"> {APP_NAME}<span className="text-white">Setu</span></span>
            </div>
            <div className="flex-1 py-4">
                <nav className="space-y-1">
                    <Link
                        to="/home"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/home')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">home</span>
                        Home
                    </Link>
                    <Link
                        to="/courses"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/courses')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">menu_book</span>
                        Courses
                    </Link>

                    <Link
                        to="/exams"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/exams')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">assignment</span>
                        All Exam
                    </Link>



                    <Link
                        to="/notes"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/notes')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">description</span>
                        Notes
                    </Link>
                    <Link
                        to="/progress"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/progress')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">trending_up</span>
                        Progress
                    </Link>
                    <Link
                        to="/leaderboard"
                        className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/leaderboard')}`}
                    >
                        <span className="material-symbols-outlined mr-3 text-xl">emoji_events</span>
                        Leaderboard
                    </Link>
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    to="/"
                    className={`flex items-center justify-center w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
                >
                    <span className="material-symbols-outlined mr-2 text-lg">dashboard</span>
                    Dashboard
                </Link>
                <Link
                    to="/about"
                    className={`flex items-center justify-center w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isActive('/about') ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined mr-2 text-lg">info</span>
                    About
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
