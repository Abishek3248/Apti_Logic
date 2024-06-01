import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import "./MentorDashboard.css";
import NavbarLogin from '../../components/NavbarLogin';

const MentorDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
    const [selectedAssessmentScores, setSelectedAssessmentScores] = useState([]);
    const [studentScores, setStudentScores] = useState([]);

    useEffect(() => {
        const fetchAssessments = async () => {
            const assessmentsQuerySnapshot = await getDocs(collection(db, 'assessments'));
            const assessmentsData = assessmentsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAssessments(assessmentsData);
        };

        fetchAssessments();
    }, []);

    const fetchStudentScores = async () => {
        const usersQuerySnapshot = await getDocs(collection(db, 'users'));
        const scoresMap = new Map();

        usersQuerySnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;
            if (userData.scores && userData.scores.length > 0) {
                let bestAttempt = userData.scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                if (!scoresMap.has(userId)) {
                    scoresMap.set(userId, {
                        userId: userId,
                        assessmentId: bestAttempt.assessmentId,
                        score: bestAttempt.score,
                        username: userData.username,
                        role: userData.role,
                        topicScores: bestAttempt.topicScores
                    });
                } else {
                    const existingBestAttempt = scoresMap.get(userId);
                    if (bestAttempt.score > existingBestAttempt.score) {
                        scoresMap.set(userId, {
                            userId: userId,
                            assessmentId: bestAttempt.assessmentId,
                            score: bestAttempt.score,
                            username: userData.username,
                            role: userData.role,
                            topicScores: bestAttempt.topicScores
                        });
                    }
                }
            }
        });

        setStudentScores([...scoresMap.values()]);
    };

    const handleViewAnalytics = async (assessmentId) => {
        const q = query(collection(db, 'scores'), where('assessmentId', '==', assessmentId));
        const querySnapshot = await getDocs(q);
        const fetchedScores = querySnapshot.docs.map(doc => doc.data());

        const bestAttemptsMap = new Map();
        fetchedScores.forEach(score => {
            if (!bestAttemptsMap.has(score.userId)) {
                bestAttemptsMap.set(score.userId, score);
            } else {
                const existingBestAttempt = bestAttemptsMap.get(score.userId);
                if (score.score > existingBestAttempt.score) {
                    bestAttemptsMap.set(score.userId, score);
                }
            }
        });

        const bestAttempts = Array.from(bestAttemptsMap.values());
        setSelectedAssessmentId(assessmentId);
        setSelectedAssessmentScores(bestAttempts);
    };

    const calculateOverallAnalytics = (userId) => {
        const studentAttempts = selectedAssessmentScores.filter(score => score.userId === userId);
        const totalAttempts = studentAttempts.length;
        const totalScore = studentAttempts.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = totalScore / totalAttempts;
        return { totalAttempts, averageScore };
    };

    const studentAnalyticsMap = new Map();
    studentScores.forEach((studentScore) => {
        if (!studentAnalyticsMap.has(studentScore.userId)) {
            const { totalAttempts, averageScore } = calculateOverallAnalytics(studentScore.userId);
            studentAnalyticsMap.set(studentScore.userId, { totalAttempts, averageScore });
        }
    });

    const closeAnalytics = () => {
        setSelectedAssessmentId(null);
        setSelectedAssessmentScores([]);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <NavbarLogin/>
            <h1 className="text-3xl font-bold text-center mb-8">Mentor Dashboard</h1>
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-8">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="text-left p-4">Assessment Title</th>
                        <th className="text-left p-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {assessments.map((assessment, index) => (
                        <tr key={index} className={`hover:bg-gray-100 transition-all ${selectedAssessmentId === assessment.id ? 'bg-gray-200' : 'bg-white'}`}>
                            <td className="p-4">{assessment.title}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => { fetchStudentScores(); handleViewAnalytics(assessment.id); }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
                                >
                                    View Analytics
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedAssessmentId && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Overall Analytics</h2>
                    <button
                        onClick={closeAnalytics}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all mb-4"
                    >
                        Close
                    </button>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="text-left p-4">Student Name</th>
                                <th className="text-left p-4">Score</th>
                                <th className="text-left p-4">Topics</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedAssessmentScores.map((score, index) => (
                                <tr key={index} className="hover:bg-gray-100 transition-all">
                                    <td className="p-4">{score.username}</td>
                                    <td className="p-4">{score.score}</td>
                                    <td className="p-4">
                                        {Object.entries(score.topicScores).map(([topic, topicScores]) => (
                                            <div key={topic} className="mb-2">
                                                <p className="font-semibold">Topic: {topic}</p>
                                                <p>Correct Answers: {topicScores.correctAnswers}</p>
                                                <p>Wrong Answers: {topicScores.wrongAnswers}</p>
                                                <p>Total Questions: {topicScores.totalQuestions}</p>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-4">
                                        {studentAnalyticsMap.has(score.userId) && (
                                            <div>
                                                <p>Total Attempts: {studentAnalyticsMap.get(score.userId).totalAttempts}</p>
                                                <p>Average Score: {studentAnalyticsMap.get(score.userId).averageScore.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MentorDashboard;
