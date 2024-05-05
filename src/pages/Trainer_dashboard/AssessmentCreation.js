import React, { useState ,useEffect} from 'react';
import { collection, getDocs, query, doc, getDoc,addDoc } from "firebase/firestore";
import { db } from '../../firebase'; // Assuming db is the initialized Firestore instance
import './AssessmentCreation.css';

const TrainerAssessment = () => {
    const [assessmentDetails, setAssessmentDetails] = useState({
        title: '',
        description: ''
    });
    const [assessments, setAssessments] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
  
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
        if (!acc[question.topic].some((q) => q.id === question.id)) {
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
    
    
    console.log("topics", topics);
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
        setQuestions([...questions, newQuestion]);
    };

    const generateQuestionSet = () => {
        const selectedQuestions = questions.filter((question) => selectedTopics.includes(question.topic));
        const randomIndices = [...Array(10)].map(() => Math.floor(Math.random() * selectedQuestions.length));
        const selectedQuestionSet = randomIndices.map(index => selectedQuestions[index]);
        setQuestions(selectedQuestionSet);
    };

    const saveAssessment = async () => {
        try {
            const assessmentRef = await addDoc(collection(db, 'assessments'), {
                title: assessmentDetails.title,
                description: assessmentDetails.description
            });

            questions.forEach(async (question) => {
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
        <div className="trainer-assessment">
            <h2 className="trainer-assessment-title assessment-head">Trainer Assessment</h2>
            <input
                className="trainer-assessment-textfield"
                type="text"
                placeholder="Title"
                value={assessmentDetails.title}
                onChange={(e) => setAssessmentDetails({ ...assessmentDetails, title: e.target.value })}
            />
            <textarea
                className="trainer-assessment-textfield"
                placeholder="Description"
                rows={9}
                value={assessmentDetails.description}
                onChange={(e) => setAssessmentDetails({ ...assessmentDetails, description: e.target.value })}
            />
            <button className="trainer-generate-question-set-btn" onClick={generateQuestionSet}>
                Generate Question Set
            </button>
            {topics.map((topic, index) => (
                <div key={index}>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic.topic)}
                            onChange={() => {
                                if (selectedTopics.includes(topic.topic)) {
                                    setSelectedTopics(selectedTopics.filter((selectedTopic) => selectedTopic !== topic.topic));
                                } else {
                                    setSelectedTopics([...selectedTopics, topic.topic]);
                                }
                            }}
                        />
                        {topic.topic}
                    </label>
                </div>
            ))}
            {questions.map((question, index) => (
                <div key={index} className="trainer-question-box">
                    <h3 className="trainer-question-title">Question {index + 1}</h3>
                    <input
                        className="trainer-option-textfield"
                        type="text"
                        placeholder="Question Text"
                        value={question.questionText}
                        onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].questionText = e.target.value;
                            setQuestions(newQuestions);
                        }}
                    />
                    {question.options.map((option, optionIndex) => (
                        <input
                            key={optionIndex}
                            className="trainer-option-textfield"
                            type="text"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].options[optionIndex] = e.target.value;
                                setQuestions(newQuestions);
                            }}
                        />
                    ))}
                    <input
                        className="trainer-option-textfield"
                        type="text"
                        placeholder="Correct Answer"
                        value={question.correctAnswer}
                        onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].correctAnswer = e.target.value;
                            setQuestions(newQuestions);
                        }}
                    />
                    <input
                        className="trainer-option-textfield"
                        type="text"
                        placeholder="Topic"
                        value={question.topic}
                        onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].topic = e.target.value;
                            setQuestions(newQuestions);
                        }}
                    />
                </div>
            ))}
            <button className="trainer-add-question-btn" onClick={addQuestion}>
                Add Question
            </button>
            <button className="trainer-save-assessment-btn" onClick={saveAssessment}>
                Save Assessment
            </button>
        </div>
    );
};

export default TrainerAssessment;
