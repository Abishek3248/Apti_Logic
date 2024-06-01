import React, { useState, useEffect } from "react";
import { collection, getDocs, query, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import UploadVideo from "./Uploadvideomodal"; // Import the updated UploadVideo component
import NavbarLogin from "../../components/NavbarLogin";

const TrainerDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicsforvideo, setTopicsforvideo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "topics"));
        const topicsData = querySnapshot.docs.map((doc) => doc.data());
        setTopicsforvideo(topicsData);
      } catch (error) {
        console.error("Error fetching topics: ", error);
      }
    };

    fetchData();
  }, []);
  console.log("video", topicsforvideo);

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
        open: false,
        youtubelink: ""
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

  const handleShowModal = (topic) => {
    setCurrentTopic(topic);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTopic(null);
  };

  const handleSaveVideo = async (topic, videoLink) => {
    setTopics((prevTopics) =>
      prevTopics.map((t) =>
        t.topic === topic.topic ? { ...t, youtubelink: videoLink } : t
      )
    );

    try {
      await setDoc(doc(db, "topics", topic.topic), {
        topic: topic.topic,
        youtubelink: videoLink,
      });
    } catch (error) {
      console.error("Error saving video link: ", error);
    }
  };

  return (
    <>
            <NavbarLogin/>

      <div className="min-h-screen bg-gray-100 p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-8">Trainer Dashboard</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h4 className="text-xl font-semibold mb-4">Assessments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicsforvideo.map((topic, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-lg shadow p-4 hover:bg-blue-100 transition-colors"
                onClick={() => handleClick(topic)}
              >
                <h5 className="text-lg font-semibold text-blue-900">{topic.topic}</h5>
                {topic.videoLink && (
                  <iframe
                    className="mt-4"
                    width="300"
                    height="200"
                    src={topic.videoLink}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            ))}
          </div>
        </div>
        <Link to="/create-assessment" className="mt-8 inline-block">
          <button className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors">
            Create Assessment
          </button>
        </Link>
        <UploadVideo
          show={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveVideo}
          topic={currentTopic}
        />
      </div>
    </>
  );
};

export default TrainerDashboard;
