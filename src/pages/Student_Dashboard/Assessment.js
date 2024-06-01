import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const Assessment = () => {
    const { assessmentId } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        const fetchAssessment = async () => {
            const assessmentRef = doc(db, 'assessments', assessmentId);
            const assessmentSnapshot = await getDoc(assessmentRef);
            if (assessmentSnapshot.exists()) {
                const assessmentData = assessmentSnapshot.data();
                const questionsRef = collection(assessmentRef, 'questions');
                const questionsSnapshot = await getDocs(questionsRef);
                const questionsData = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAssessment({ id: assessmentSnapshot.id, ...assessmentData, questions: questionsData });
                initializeSelectedAnswers(questionsData);
            } else {
                console.error('Assessment not found');
            }
        };

        fetchAssessment();
    }, [assessmentId]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setSelectedAnswers(prevState => ({
            ...prevState,
            [questionId]: selectedOption
        }));
    };

    const initializeSelectedAnswers = (questions) => {
        const answers = {};
        questions.forEach((question) => {
            answers[question.id] = null;
        });
        setSelectedAnswers(answers);
    };

    const handleSubmit = async () => {
        let totalScore = 0;
        const topicScores = {};

        assessment.questions.forEach((question) => {
            const { id, topic, correctAnswer } = question;
            const studentAnswer = selectedAnswers[id];
            const isCorrect = studentAnswer === correctAnswer;

            if (!topicScores[topic]) {
                topicScores[topic] = {
                    totalQuestions: 1,
                    correctAnswers: isCorrect ? 1 : 0,
                    wrongAnswers: isCorrect ? 0 : 1,
                };
            } else {
                topicScores[topic].totalQuestions++;
                if (isCorrect) {
                    topicScores[topic].correctAnswers++;
                } else {
                    topicScores[topic].wrongAnswers++;
                }
            }

            if (isCorrect) {
                totalScore++;
            }
        });

        setScore(totalScore);

        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnapshot = await getDoc(userRef);
        if (!userDocSnapshot.exists()) {
            console.error('User not found with ID:', auth.currentUser.uid);
            return;
        }
        const userData = userDocSnapshot.data();
        const username = userData.username;

        const scoreData = {
            username: username,
            userId: auth.currentUser.uid,
            assessmentId: assessment.id,
            score: totalScore,
            topicScores: topicScores,
        };

        await addDoc(collection(db, 'scores'), scoreData);
        await updateDoc(userRef, { scores: arrayUnion(scoreData) });

        setIsSubmitted(true);
    };

    const handleShowAnswers = () => {
        setShowAnswers(!showAnswers);
    };

    if (!assessment) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-10">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 text-blue-700">{assessment.title}</h1>
                <p className="text-gray-600">Test your knowledge by answering the questions below.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-inner">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Questions</h2>
                {assessment.questions && assessment.questions.length > 0 ? (
                    <div>
                        {assessment.questions.map((question, index) => (
                            <div
                                key={index}
                                className={`mb-6 p-4 rounded-lg shadow-md transition duration-300 ${
                                    isSubmitted
                                        ? selectedAnswers[question.id] === question.correctAnswer
                                            ? 'bg-green-100 border border-green-500'
                                            : 'bg-red-100 border border-red-500'
                                        : 'bg-gray-50 hover:bg-gray-200'
                                }`}
                            >
                                <p className="text-xl mb-2 text-gray-800">
                                    {index + 1}. {question.questionText}
                                </p>
                                <ul className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <li key={optionIndex} className="flex items-center">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    onChange={() => handleAnswerSelect(question.id, option)}
                                                    checked={selectedAnswers[question.id] === option}
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                    disabled={isSubmitted}
                                                />
                                                <span>{option}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        {score > 0 && <p className="text-xl font-semibold mt-4 text-green-600">Score: {score}</p>}
                        <div className="text-center mt-6">
                            <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-300 transform hover:scale-105" onClick={handleSubmit} disabled={isSubmitted}>
                                Submit
                            </button>
                            {isSubmitted && (
                                <>
                                    <p className="text-green-500 mt-4">Score submitted successfully!</p>
                                    <button
                                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition duration-300 transform hover:scale-105 mt-4"
                                        onClick={handleShowAnswers}
                                    >
                                        Show Answers
                                    </button>
                                </>
                            )}
                        </div>
                        {showAnswers && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-4 text-purple-700">Correct Answers</h3>
                                <ul className="space-y-2">
                                    {assessment.questions.map((question, index) => (
                                        <li key={index} className="text-gray-700">
                                            <strong>{index + 1}. {question.questionText}</strong>: {question.correctAnswer}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-red-500">No questions found for this assessment.</div>
                )}
            </div>
        </div>
    );
};

export default Assessment;
