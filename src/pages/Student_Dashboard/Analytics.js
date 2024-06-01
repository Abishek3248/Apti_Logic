import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../UserContext';
import "./Analytics.css"; // Import your CSS file

const StudentAnalytics = () => {
    const { assessmentId } = useParams();
    const { user } = useUser();
    const [assessmentScores, setAssessmentScores] = useState([]);
    const [improvementTips, setImprovementTips] = useState({});
    const [averageScore, setAverageScore] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);

    const fetchAssessmentScores = async () => {
        if (!user || !user.uid) {
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            console.error('User document not found');
            return;
        }

        const userData = userDoc.data();
        if (!userData.scores || !Array.isArray(userData.scores)) {
            console.error('User scores not found or not an array');
            return;
        }

        const assessmentScores = userData.scores.filter(score => score.assessmentId === assessmentId);
        setAssessmentScores(assessmentScores);

        // Calculate additional analytics
        const totalAttempts = assessmentScores.length;
        const totalScore = assessmentScores.reduce((acc, score) => acc + score.score, 0);
        const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts) : 0;

        setTotalAttempts(totalAttempts);
        setAverageScore(averageScore);

        // Analyze scores and provide improvement tips
        const tips = analyzeScores(assessmentScores);
        setImprovementTips(tips);
    };

    useEffect(() => {
        if (user) {
            fetchAssessmentScores();
        }
    }, [user]);

    const analyzeScores = (scores) => {
        const tips = {};
        scores.forEach(score => {
            if (score.topicScores) {
                Object.entries(score.topicScores).forEach(([topic, scores]) => {
                    if (!tips[topic]) {
                        tips[topic] = {
                            strong: [],
                            weak: []
                        };
                    }
                    if (scores.correctAnswers / scores.totalQuestions >= 0.8) {
                        tips[topic].strong.push(score.username);
                    } else {
                        tips[topic].weak.push(score.username);
                    }
                });
            }
        });
        return tips;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-10">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 text-blue-700">Assessment Analytics</h1>
                <p className="text-gray-600">Review your performance and get tips for improvement.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-inner">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Overall Performance</h2>
                <p className="text-xl text-gray-700">Total Attempts: {totalAttempts}</p>
                <p className="text-xl text-gray-700">Average Score: {averageScore.toFixed(2)}</p>

                {assessmentScores.length > 0 ? (
                    assessmentScores.map((score, index) => (
                        <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800">Attempt {index + 1}</h3>
                            <p className="text-gray-700">Score: {score.score}</p>
                            <h4 className="text-lg font-semibold text-gray-800">Topic-wise Scores:</h4>
                            {score.topicScores && Object.entries(score.topicScores).map(([topic, scores]) => (
                                <div key={topic} className="mt-4 p-4 bg-gray-100 rounded-lg">
                                    <p className="text-gray-800"><strong>Topic:</strong> {topic}</p>
                                    <p className="text-gray-800"><strong>Correct Answers:</strong> {scores.correctAnswers}</p>
                                    <p className="text-gray-800"><strong>Wrong Answers:</strong> {scores.wrongAnswers}</p>
                                    <p className="text-gray-800"><strong>Total Questions:</strong> {scores.totalQuestions}</p>
                                    <p className={`text-lg mt-2 ${improvementTips[topic]?.weak.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {improvementTips[topic]?.strong.length > 0 &&
                                            `You are strong in this topic. Focus on other areas.`}
                                        {improvementTips[topic]?.weak.length > 0 &&
                                            `You need improvement in this topic. Practice more.`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-red-500 mt-4">No scores available for this assessment.</div>
                )}
            </div>
        </div>
    );
};

export default StudentAnalytics;
