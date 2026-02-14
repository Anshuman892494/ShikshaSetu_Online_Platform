import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { createExam } from '../../services/examApi';

const CreateExam = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState(15);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showResult, setShowResult] = useState(true);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [questionType, setQuestionType] = useState('MCQ'); // Global default
    const [securityKey, setSecurityKey] = useState('');
    const [category, setCategory] = useState('All Exam');
    const [securityEnabled, setSecurityEnabled] = useState(false);
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correctIndex: 0, type: 'MCQ' }
    ]);
    const navigate = useNavigate();

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];

        // If changing type, reset options and correctIndex
        if (field === 'type') {
            if (value === 'True/False') {
                newQuestions[index].options = ['True', 'False'];
                newQuestions[index].correctIndex = 0;
            } else {
                newQuestions[index].options = ['', '', '', ''],
                    newQuestions[index].correctIndex = 0;
            }
        }

        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        // Use global questionType for new question
        if (questionType === 'True/False') {
            setQuestions([...questions, { text: '', options: ['True', 'False'], correctIndex: 0, type: 'True/False' }]);
        } else {
            setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, type: 'MCQ' }]);
        }
    };

    const handleQuestionTypeChange = (e) => {
        setQuestionType(e.target.value);
        // Do NOT reset existing questions
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Convert to JSON with raw header array
                // Expected header: Type (Optional), Question, Opt1, Opt2, Opt3, Opt4, Correct Answer
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Simple heuristic: If first row contains "Question", treat it as header and skip
                const hasHeader = data[0].some(cell => typeof cell === 'string' && cell.toLowerCase() === 'question');
                const rows = hasHeader ? data.slice(1) : data;

                const importedQuestions = rows.map(row => {
                    // Normalize row length just in case
                    if (row.length < 2) return null;

                    let type = 'MCQ';
                    let questionText = '';
                    let options = ['', '', '', ''];
                    let correctIndex = 0;

                    // Detection strategy: Check if first column looks like a type
                    const firstCol = (row[0] || '').toString().toLowerCase().trim();
                    const isTypeColumn = firstCol === 'mcq' || firstCol === 'true/false';

                    if (isTypeColumn) {
                        type = row[0].toString().trim() === 'True/False' ? 'True/False' : 'MCQ'; // Keep original case if needed or normalize
                        if (firstCol === 'true/false') type = 'True/False'; // Normalize

                        questionText = row[1];
                        // For T/F, options are fixed
                        if (type === 'True/False') {
                            options = ['True', 'False'];
                            correctIndex = (parseInt(row[6]) || 1) - 1;
                        } else {
                            options = [row[2], row[3], row[4], row[5]];
                            correctIndex = (parseInt(row[6]) || 1) - 1;
                        }
                    } else {
                        // Legacy format: Question | Opt1 | Opt2 | Opt3 | Opt4 | Correct
                        questionText = row[0];
                        options = [row[1], row[2], row[3], row[4]];
                        correctIndex = (parseInt(row[5]) || 1) - 1;
                    }

                    return {
                        text: questionText,
                        options: options,
                        correctIndex: correctIndex,
                        type: type
                    };
                }).filter(q => q !== null && q.text);

                if (importedQuestions.length > 0) {
                    setQuestions(prev => [...prev, ...importedQuestions]);
                    alert(`Successfully imported ${importedQuestions.length} questions!`);
                } else {
                    alert("No valid questions found in file.");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to parse Excel file");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createExam({
                title,
                description,
                timeLimitMinutes: timeLimit,
                endTime,
                showResult,
                randomizeQuestions,
                questionType,
                questions,
                startTime,
                securityKey,
                category,
                securityEnabled
            });
            alert('Exam Created Successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Failed to create exam');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 pb-20 text-gray-100">
            <nav className="bg-gray-800 shadow-lg px-8 py-5 flex justify-between items-center fixed top-0 left-0 right-0 z-10 h-20 text-white mb-8 border-b border-gray-700">
                <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold text-red-500 font-mono tracking-tight">Create New Exam</h1>
                    <div className="hidden md:flex items-center text-gray-400 text-sm font-medium bg-gray-700/50 px-4 py-2 rounded-full border border-gray-600/50">
                        <span className="mr-2">📅</span>
                        {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors font-medium border border-gray-600/50 px-4 py-2 rounded-lg hover:bg-gray-700/50">Back to Dashboard</button>
            </nav>

            <div className="max-w-4xl mx-auto mt-24 bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Exam Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit (Minutes)</label>
                            <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time (Optional)</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">End Time (Optional)</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none [color-scheme:dark]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="All Exam">All Exam</option>
                                <option value="Class Test">Class Test</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Select where this exam should be displayed.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Default Question Type</label>
                        <select
                            value={questionType}
                            onChange={handleQuestionTypeChange}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
                        >
                            <option value="MCQ">Multiple Choice (MCQ)</option>
                            <option value="True/False">True / False</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Sets the type for <strong>newly added</strong> questions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <input
                                type="checkbox"
                                id="showResult"
                                checked={showResult}
                                onChange={(e) => setShowResult(e.target.checked)}
                                className="w-5 h-5 text-red-600 rounded bg-gray-700 border-gray-500 focus:ring-red-500 focus:ring-offset-gray-900 shadow-sm"
                            />
                            <label htmlFor="showResult" className="text-gray-300 font-medium cursor-pointer select-none">
                                Show Result to Student
                            </label>
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <input
                                type="checkbox"
                                id="randomizeQuestions"
                                checked={randomizeQuestions}
                                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                                className="w-5 h-5 text-red-600 rounded bg-gray-700 border-gray-500 focus:ring-red-500 focus:ring-offset-gray-900 shadow-sm"
                            />
                            <label htmlFor="randomizeQuestions" className="text-gray-300 font-medium cursor-pointer select-none">
                                Randomize Question Order
                            </label>
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <input
                                type="checkbox"
                                id="securityEnabled"
                                checked={securityEnabled}
                                onChange={(e) => setSecurityEnabled(e.target.checked)}
                                className="w-5 h-5 text-red-600 rounded bg-gray-700 border-gray-500 focus:ring-red-500 focus:ring-offset-gray-900 shadow-sm"
                            />
                            <label htmlFor="securityEnabled" className="text-gray-300 font-medium cursor-pointer select-none">
                                Enable Strict Security Mode
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-400" rows="2"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Security Key {securityEnabled && <span className="text-red-500">*</span>}</label>
                        <input
                            type="text"
                            value={securityKey}
                            onChange={e => setSecurityKey(e.target.value)}
                            placeholder={securityEnabled ? "Enter a password to protect this exam" : "Security disabled - key not needed"}
                            disabled={!securityEnabled}
                            required={securityEnabled}
                            className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-400 ${!securityEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {securityEnabled
                                ? "Required when security mode is enabled. Students will need this key to start the exam."
                                : "Enable security mode above to set a security key."
                            }
                        </p>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-100">Questions</h3>
                            <div className="relative">
                                <label htmlFor="excel-upload" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block">
                                    📥 Import Excel
                                </label>
                                <input
                                    id="excel-upload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-6 bg-gray-700/30 p-2 rounded border border-gray-600/30">
                            <strong>Excel Format:</strong> [Type (Optional)] | Question | Option 1 | Option 2 | Option 3 | Option 4 | Correct Answer (1-4)<br />
                            <em>Example (MCQ):</em> MCQ | What is 2+2? | 3 | 4 | 5 | 6 | 2<br />
                            <em>Example (T/F):</em> True/False | The sky is blue | (leave empty) | (leave empty) | (leave empty) | (leave empty) | 1
                        </p>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-700/50 p-6 rounded-lg mb-6 border border-gray-600 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-200 mt-2">Question {qIndex + 1}</h4>
                                    <div className="flex items-center space-x-3">
                                        <select
                                            value={q.type || 'MCQ'}
                                            onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                            className="bg-gray-600 border border-gray-500 text-xs text-white rounded px-2 py-1 outline-none"
                                        >
                                            <option value="MCQ">MCQ</option>
                                            <option value="True/False">True/False</option>
                                        </select>
                                        {questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Enter question text (supports code snippets)"
                                    value={q.text}
                                    onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg mb-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIndex) => (
                                        <input
                                            key={oIndex}
                                            type="text"
                                            placeholder={`Option ${oIndex + 1}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            required
                                            readOnly={q.type === 'True/False'}
                                            className={`w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none ${q.correctIndex === oIndex ? 'border-green-500 ring-1 ring-green-500' : ''} ${q.type === 'True/False' ? 'cursor-not-allowed opacity-75' : ''}`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <label className="text-sm text-gray-300 mr-2">Correct Option:</label>
                                    <select
                                        value={q.correctIndex}
                                        onChange={e => handleQuestionChange(qIndex, 'correctIndex', parseInt(e.target.value))}
                                        className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 outline-none"
                                    >
                                        {q.options.map((opt, i) => (
                                            <option key={i} value={i}>
                                                {q.type === 'True/False' ? opt : `Option ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors">
                            + Add Question
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg transition-colors">
                        Publish Exam
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;
