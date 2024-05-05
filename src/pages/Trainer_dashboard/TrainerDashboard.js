import React, { useState, useEffect } from "react";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./TrainerDashboard.css";
import { Link } from "react-router-dom";


const TrainerDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);

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
  
  return (
    <>
      <div className="trainer-overall">
        <h2 className="trainer-head-here"> Trainer Dashboard </h2>
        <div className="trainer-dashboard">
          <div className="trainer-dashboard-title">
            <h4 className="trainer-head-2-here"></h4>
          </div>
          <div className="trainer-dashboard-assessments">
  {topics.map((topic, index) => (
    <div key={index} className="trainer-assessment-card" onClick={() => handleClick(topic)}>
      <div className="assessment-details">
        <h5 className="text-title">{topic.topic}</h5>
        {topic.open ? (
          <ul>
            {topic.questions.map((question, qIndex) => (
              <li key={qIndex}>{question.questionText}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  ))}
</div>

        </div>
        <Link to="/create-assessment" style={{ textDecoration: "none" }}>
          <button className="create-assessment-btn-here">
            <span className="text">Create Assessment</span>
          </button>
        </Link>
      </div>
    </>
  );
};

export default TrainerDashboard;
