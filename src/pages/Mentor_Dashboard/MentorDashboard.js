import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import "./MentorDashboard.css"
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
        const scoresMap = new Map(); // Map to store the best attempt for each student
    
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
    
        setStudentScores([...scoresMap.values()]); // Convert map values back to an array for rendering
    };
    
    
    
    const handleViewAnalytics = async (assessmentId) => {
        const q = query(collection(db, 'scores'), where('assessmentId', '==', assessmentId));
        const querySnapshot = await getDocs(q);
        const fetchedScores = querySnapshot.docs.map(doc => doc.data());
        
        // Filter out only the best attempt for each user
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
    

    // const calculateOverallAnalytics = (userId) => {
    //     const studentAttempts = selectedAssessmentScores.filter(score => score.userId === userId);
    //     const totalAttempts = studentAttempts.length;
    //     const totalScore = studentAttempts.reduce((acc, curr) => acc + curr.score, 0);
    //     const averageScore = totalScore / totalAttempts;
    //     return { totalAttempts, averageScore };
    // };
    const calculateOverallAnalytics = (userId) => {
        const studentAttempts = selectedAssessmentScores.filter(score => score.userId === userId);
        const totalAttempts = studentAttempts.length;
        const totalScore = studentAttempts.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = totalScore / totalAttempts;
        return { totalAttempts, averageScore };
    };
    
    const studentAnalyticsMap = new Map(); // Create a map to store overall analytics for each student
    
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
console.log()
    return (
        <div className="mentor-dashboard-container">
            <h1 className="analytics-title">Mentor Dashboard</h1>
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Assessment Title</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {assessments.map((assessment, index) => (
                        <tr key={index} className={selectedAssessmentId === assessment.id ? 'selected-row' : 'normal-row'}>
                            <td>{assessment.title}</td>
                            <td>
                                <button onClick={() => { fetchStudentScores(); handleViewAnalytics(assessment.id); }} className='view-analytics-btn'>View Analytics</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedAssessmentId && (
                <div>
                    <h2 className='analytics-title'>Overall Analytics</h2>
                    <button onClick={closeAnalytics} className='close-analytics-btn'>Close</button>
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Score</th>
                                <th>Topics</th>
                                {/* <th>Overall Analytics</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedAssessmentScores.map((score, index) => (
                                <tr key={index}>
                                    <td>{score.username}</td>
                                    <td>{score.score}</td>
                                    <td>
                                        {Object.entries(score.topicScores).map(([topic, topicScores]) => (
                                            <div key={topic}>
                                                <p>Topic: {topic}</p>
                                                <p>Correct Answers: {topicScores.correctAnswers}</p>
                                                <p>Wrong Answers: {topicScores.wrongAnswers}</p>
                                                <p>Total Questions: {topicScores.totalQuestions}</p>
                                            </div>
                                        ))}
                                    </td>
                                    <td>
    {studentAnalyticsMap.has(score.userId) && (
        <div>
            {/* <p>Total Attempts: {studentAnalyticsMap.get(score.userId).totalAttempts}</p> */}
            {/* <p>Average Score: {studentAnalyticsMap.get(score.userId).averageScore.toFixed(2)}</p> */}
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
