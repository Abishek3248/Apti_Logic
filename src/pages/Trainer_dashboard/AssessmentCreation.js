import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from '../../firebase'; // Assuming db is the initialized Firestore instance
import Navbar from '../../components/Navbar';
import './AssessmentCreation.css';
import NavbarLogin from '../../components/NavbarLogin';

const TrainerAssessment = () => {
    const [assessmentDetails, setAssessmentDetails] = useState({
        title: '',
        description: ''
    });
    const [assessments, setAssessments] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [questionstodisplay, setQuestionstodisplay] = useState([]);

    useEffect(() => {
        const fetchAssessments = async () => {
            const q = query(collection(db, "assessments"));
            const querySnapshot = await getDocs(q);
            const fetchedAssessments = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAssessments(fetchedAssessments);

            fetchedAssessments.map(async (assessment) => {
                const assessmentRef = doc(db, "assessments", assessment.id);
                const assessmentSnapshot = await getDoc(assessmentRef);
                if (assessmentSnapshot.exists()) {
                    const questionsRef = collection(assessmentRef, "questions");
                    const questionsSnapshot = await getDocs(questionsRef);
                    const questionsData = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setQuestions((prevQuestions) => [...prevQuestions, ...questionsData]);
                }
            });
        };

        fetchAssessments();
    }, []);

    useEffect(() => {
        const topicsMap = questions.reduce((acc, question) => {
            if (!acc[question.topic]) {
                acc[question.topic] = [];
            }
            if (!acc[question.topic].some((q) => q.questionText === question.questionText && JSON.stringify(q.options) === JSON.stringify(question.options))) {
                acc[question.topic].push(question);
            }

            return acc;
        }, {});
        setTopics(
            Object.entries(topicsMap).map(([topic, questions]) => ({
                topic,
                questions,
                open: false, // Initialize open state to false
            }))
        );
    }, [questions]);

    const handleClick = (clickedTopic) => {
        setTopics((prevTopics) =>
            prevTopics.map((topic) =>
                topic.topic === clickedTopic.topic ? { ...topic, open: !topic.open } : topic
            )
        );
    };

    const addQuestion = () => {
        const newQuestion = {
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            topic: ''
        };
        setQuestionstodisplay([...questionstodisplay, newQuestion]);
    };

    const generateQuestionSet = () => {
        const selectedQuestions = questions.filter((question) => selectedTopics.includes(question.topic));
        const selectedQuestionSet = selectedQuestions.reduce((acc, question) => {
            if (!acc.some((q) => q.questionText === question.questionText)) {
                acc.push(question);
            }
            return acc;
        }, []);
        setQuestionstodisplay(selectedQuestionSet);
    };

    const saveAssessment = async () => {
        try {
            const assessmentRef = await addDoc(collection(db, 'assessments'), {
                title: assessmentDetails.title,
                description: assessmentDetails.description
            });

            questionstodisplay.forEach(async (question) => {
                await addDoc(collection(assessmentRef, 'questions'), {
                    questionText: question.questionText,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    topic: question.topic
                });
            });

            alert('Assessment created successfully');
        } catch (error) {
            console.error('Error creating assessment: ', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <NavbarLogin/>
                        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-blue-900 mt-10 animate-fade-in">Create a new assessment</h2>
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 animate-fade-in">
                    <input
                        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
                        type="text"
                        placeholder="Title"
                        value={assessmentDetails.title}
                        onChange={(e) => setAssessmentDetails({ ...assessmentDetails, title: e.target.value })}
                    />
                    <textarea
                        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Description"
                        rows={4}
                        value={assessmentDetails.description}
                        onChange={(e) => setAssessmentDetails({ ...assessmentDetails, description: e.target.value })}
                    />
                 
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 animate-fade-in">
                    <h4 className="text-xl font-semibold mb-4">Select Topics</h4>
                    {topics.map((topic, index) => (
                        <div key={index} className="mb-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                    checked={selectedTopics.includes(topic.topic)}
                                    onChange={() => {
                                        if (selectedTopics.includes(topic.topic)) {
                                            setSelectedTopics(selectedTopics.filter((selectedTopic) => selectedTopic !== topic.topic));
                                        } else {
                                            setSelectedTopics([...selectedTopics, topic.topic]);
                                        }
                                    }}
                                />
                                <span className="ml-2 text-gray-700">{topic.topic}</span>
                            </label>
                        </div>
                    ))}
                       <button className="w-full px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 animate-fade-in" onClick={generateQuestionSet}>
                        Generate Question Set
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 animate-fade-in">
                    <h4 className="text-xl font-semibold mb-4">Questions</h4>
                    {questionstodisplay.map((question, index) => (
                        <div key={index} className="mb-6">
                            <h5 className="text-lg font-semibold mb-2">Question {index + 1}</h5>
                            <input
                                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                type="text"
                                placeholder="Question Text"
                                value={question.questionText}
                                onChange={(e) => {
                                    const newQuestions = [...questionstodisplay];
                                    newQuestions[index].questionText = e.target.value;
                                    setQuestionstodisplay(newQuestions);
                                }}
                            />
                            {question.options.map((option, optionIndex) => (
                                <input
                                    key={optionIndex}
                                    className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                    type="text"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                        const newQuestions = [...questionstodisplay];
                                        newQuestions[index].options[optionIndex] = e.target.value;
                                        setQuestionstodisplay(newQuestions);
                                    }}
                                />
                            ))}
                            <input
                                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                type="text"
                                placeholder="Correct Answer"
                                value={question.correctAnswer}
                                onChange={(e) => {
                                    const newQuestions = [...questionstodisplay];
                                    newQuestions[index].correctAnswer = e.target.value;
                                    setQuestionstodisplay(newQuestions);
                                }}
                            />
                            <input
                                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                type="text"
                                placeholder="Topic"
                                value={question.topic}
                                onChange={(e) => {
                                    const newQuestions = [...questionstodisplay];
                                    newQuestions[index].topic = e.target.value;
                                    setQuestionstodisplay(newQuestions);
                                }}
                            />
                        </div>
                    ))}
                    <button className="w-full px-4 py-2 mb-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 animate-fade-in" onClick={addQuestion}>
                        Add Question
                    </button>
                </div>

                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 animate-fade-in" onClick={saveAssessment}>
                    Save Assessment
                </button>
            </div>
        </div>
    );
};

export default TrainerAssessment;
