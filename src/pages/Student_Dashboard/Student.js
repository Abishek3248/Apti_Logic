import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs , getDoc, query ,doc} from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../UserContext';
import './Student.css'
import Forum from './Forum';
const StudentDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const { user } = useUser();
    const [userData,setUserData]=useState("")
    useEffect(() => {
        const fetchAssessments = async () => {
            const userRef = doc(db, 'users', user.uid);
            // console.log("ref",userRef)
            const userDoc = await getDoc(userRef);
            // console.log("ref",userDoc)
            const userData = userDoc.data();
            console.log("ref",userData)
            setUserData(userData)
            const q = query(collection(db, 'assessments'));
            const querySnapshot = await getDocs(q);
            const fetchedAssessments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAssessments(fetchedAssessments);
        };

        fetchAssessments();
    }, []);

    return (
        <>
        <div className="student-dashboard">
            
            <div className="student-dashboard-title">
           
                <h3>Welcome, {user ? userData.username : 'Guest'}!</h3>

         <h4 className='available-assessment'>Available Assessments</h4>


            </div>
            <div className="student-dashboard-assessments">

                {assessments.map(assessment => (
                    <div key={assessment.id} className="assessment-card">
                  <div className='assessment-details'> 
                  <h5 className='text-title'>{assessment.title}</h5>
                        <p className='assessment-card-details'>{assessment.description}</p>
                  </div>
                 
                     <div className='assessment-card-buttons'>
                     <Link to={`/student-dashboard/${assessment.id}`} className="student-dashboard-button primary assessment-card-button1 ">
                            Attend Assessment
                        </Link>
                        <Link to={`/student-analytics/${assessment.id}`} className="student-dashboard-button secondary assessment-card-button2 ">
                            View Analytics
                        </Link>
                     </div>
                       
                    </div>
                    
                ))}
            </div>
            <div className='footer'><span>Have any doubts make use of our </span><Link to={`/forum`} className="forum-button">Discussions  </Link>
</div>
        </div>
    
       </>
    );
};

export default StudentDashboard
