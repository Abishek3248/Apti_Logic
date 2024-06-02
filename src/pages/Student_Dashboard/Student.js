import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, getDoc, query, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../UserContext';
import Navbar from '../../components/Navbar';
import NavbarLogin from '../../components/NavbarLogin';

const StudentDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const { user } = useUser();
    const [userData, setUserData] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

    useEffect(() => {
        const fetchAssessmentsAndTutorials = async () => {
            try {
                // Fetch user data
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserData(userData);
                } else {
                    console.log('No such user document!');
                }

                // Fetch assessments
                const assessmentsQuery = query(collection(db, 'assessments'));
                const assessmentsSnapshot = await getDocs(assessmentsQuery);
                const fetchedAssessments = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAssessments(fetchedAssessments);

                // Fetch tutorials
                const tutorialsQuery = query(collection(db, 'topics'));
                const tutorialsSnapshot = await getDocs(tutorialsQuery);
                const fetchedTutorials = tutorialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTutorials(fetchedTutorials);
                
                console.log('User Data:', userData);
                console.log('Assessments:', fetchedAssessments);
                console.log('Tutorials:', fetchedTutorials);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (user?.uid) {
            fetchAssessmentsAndTutorials();
        }
    }, [user?.uid]);

    const handleOpenModal = (videoUrl) => {
        console.log("Vied",videoUrl)
        setSelectedVideoUrl(videoUrl);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedVideoUrl("");
    };

    return (
        <div>
            <NavbarLogin/>
            <div className="student-dashboard container mx-auto px-4 py-8">
                <div className="student-dashboard-title mb-8">
                    <h3 className="text-2xl font-bold">Welcome, {user ? userData.username : 'Guest'}!</h3>
                    <h4 className="text-xl font-semibold mt-4">Available Assessments</h4>
                </div>
                <div className="student-dashboard-assessments grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(assessment => (
                        <div key={assessment.id} className="assessment-card bg-white p-6 rounded-lg shadow-lg">
                            <div className="assessment-details mb-4">
                                <h5 className="text-lg font-semibold mb-2">{assessment.title}</h5>
                                <p className="text-gray-700">{assessment.description}</p>
                            </div>
                            <div className="assessment-card-buttons flex justify-between">
                                <Link to={`/student-dashboard/${assessment.id}`} className="student-dashboard-button primary bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Attend Assessment
                                </Link>
                                <Link to={`/student-analytics/${assessment.id}`} className="student-dashboard-button secondary bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    View Analytics
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="tutorials mt-8">
                    <h4 className="text-xl font-semibold mb-4">Watch Tutorials</h4>
                    <div className="tutorials-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutorials.map((tutorial, index) => (
                            <div key={index} className="tutorial-card bg-white p-6 rounded-lg shadow-lg cursor-pointer" onClick={() => handleOpenModal(tutorial.videoLink)}>
                                <h5 className="text-lg font-semibold mb-2">{tutorial.topic}</h5>
                                <p className="text-blue-600 underline">Watch Tutorial</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="footer mt-8 text-center">
                    <span>Have any doubts? Make use of our </span>
                    <Link to="/forum" className="forum-button text-blue-600 hover:underline">
                        Discussions
                    </Link>
                </div>
            </div>

            {showModal && (
             <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
             <div className="bg-white p-4 rounded-lg shadow-lg relative" style={{ width: '70%', height: '35vw' }}>
                 <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-700">
                     &times;
                 </button>
                 <iframe
                     className="mt-4"
                     width="100%"
                     height="100%"
                     src={selectedVideoUrl}
                     title="YouTube video player"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                 ></iframe>
             </div>
         </div>
         
          
            
            )}
        </div>
    );
};

export default StudentDashboard;
