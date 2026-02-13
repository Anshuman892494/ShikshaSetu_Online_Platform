import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
    // withCredentials: true, // enable only if you're using cookies auth
});

// Optional: nice error logs
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err?.response?.data || err.message);
        return Promise.reject(err);
    }
);

// Add auth token to requests if available
api.interceptors.request.use(
    (config) => {
        const adminSession = localStorage.getItem('admin_session');
        if (adminSession) {
            const { token } = JSON.parse(adminSession);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getExams = (params) => api.get("/exams", { params });
export const getExamById = (id) => api.get(`/exams/${id}`);
export const getAdminExamById = (id) => api.get(`/admin/exams/${id}`);
export const createExam = (examData) => api.post("/exams", examData);
export const updateExam = (id, examData) => api.put(`/exams/${id}`, examData);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

export const submitExam = (submissionData) => api.post("/results/submit", submissionData);
export const getResultById = (id) => api.get(`/results/${id}`);
export const getUserResults = (sessionId) => api.get(`/results/session/${sessionId}`);



// Admin
export const adminLogin = (creds) => api.post("/admin/login", creds);
export const forgotPassword = (phone) => api.post("/admin/forgot-password", { phone });
export const resetPassword = (adminId, newPassword) =>
    api.post("/admin/reset-password", { adminId, newPassword });

export const getAdminResults = () => api.get("/admin/results");
export const getAdminExams = () => api.get("/admin/exams");
export const getStudentReportCards = () => api.get("/admin/report-cards");
export const getMonthlyLeaderboard = () => api.get("/admin/leaderboard");
export const getLeaderboard = () => api.get("/results/leaderboard"); // Public student leaderboard
export const copyExam = (id) => api.post(`/exams/${id}/copy`);

export const verifyExamKey = (id, key) => api.post(`/exams/${id}/verify-key`, { key });

export const getAllSessions = () => api.get("/session");
export const deleteSession = (id) => api.delete(`/session/${id}`);
export const deleteResult = (id) => api.delete(`/admin/results/${id}`);
export const getAdminResultById = (id) => api.get(`/admin/results/${id}`);

// Student Management
export const addStudent = (data) => api.post("/students", data);
export const addStudentsBulk = (data) => api.post("/students/bulk", data); // data = { students: [] }
export const getAllStudents = () => api.get("/students");
export const getStudentById = (id) => api.get(`/students/${id}`);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const studentLogin = (email, password) => api.post("/students/login", { email, password });
export const resetStudentPassword = (data) => api.post("/students/reset-password", data);
export const verifyStudentDetails = (data) => api.post("/students/verify-details", data);
export const registerStudent = (data) => api.post("/students/register", data);
export const markAttendance = (id) => api.post(`/students/${id}/attendance`);
export const getStudentStats = (id) => api.get(`/students/${id}/stats`);

export const sendFeedback = (data) => api.post("/feedback/send", data);

export default api;

