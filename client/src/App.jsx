import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateExam from './pages/Admin/CreateExam';
import EditExam from './pages/Admin/EditExam';
import ExamList from './pages/Exams/ExamList';
import ExamAttempt from './pages/Exams/ExamAttempt';
import ExamInstructions from './pages/Exams/ExamInstructions';
import ExamWaiting from './pages/Exams/ExamWaiting';
import ExamSecurityCheck from './pages/Exams/ExamSecurityCheck';
import Result from './pages/Exams/Result';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Notes from './pages/Notes';
import Courses from './pages/Courses';
import Progress from './pages/Progress';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { APP_NAME } from './utils/constants';

import SplashScreen from './components/SplashScreen';

const PrivateRoute = ({ children, studentOnly = false }) => {
  const sessionStr = localStorage.getItem('session');
  if (!sessionStr) return <Navigate to="/login" replace />;

  const session = JSON.parse(sessionStr);
  if (new Date(session.expiresAt) < new Date()) {
    localStorage.removeItem('session');
    return <Navigate to="/login" replace />;
  }



  return children;
};

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/exams" element={<PrivateRoute><ExamList category="All Exam" /></PrivateRoute>} />


        <Route path="/tally-exams" element={<PrivateRoute studentOnly><ExamList category="Tally" /></PrivateRoute>} />
        <Route path="/exams/:id" element={<PrivateRoute><ExamAttempt /></PrivateRoute>} />
        <Route path="/exams/:id/security-check" element={<PrivateRoute><ExamSecurityCheck /></PrivateRoute>} />
        <Route path="/exams/:id/instructions" element={<PrivateRoute><ExamInstructions /></PrivateRoute>} />
        <Route path="/exams/:id/waiting" element={<PrivateRoute><ExamWaiting /></PrivateRoute>} />
        <Route path="/result/:resultId" element={<PrivateRoute><Result /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-exam" element={<CreateExam />} />
        <Route path="/admin/result/:resultId" element={<Result isAdmin={true} />} />

        <Route path="/feedback" element={<PrivateRoute studentOnly><Feedback /></PrivateRoute>} />


        <Route path="/admin/edit-exam/:id" element={<EditExam />} />


        <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute studentOnly><Notes /></PrivateRoute>} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
