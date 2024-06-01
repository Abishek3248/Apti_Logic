import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import TrainerDashboard from './pages/Trainer_dashboard/TrainerDashboard';
import AssessmentCreation from './pages/Trainer_dashboard/AssessmentCreation';
import StudentDashboard from './pages/Student_Dashboard/Student';
import Assessment from './pages/Student_Dashboard/Assessment'; // Import your Assessment component
import { UserProvider } from './pages/UserContext';
import MentorDashboard from './pages/Mentor_Dashboard/MentorDashboard';
import Analytics from './pages/Student_Dashboard/Analytics';
import Forum from './pages/Student_Dashboard/Forum';

function App() {
    console.log()
    return (
        <UserProvider>

        <BrowserRouter>
            <Routes>
                <Route index element={<Home/>} />
                <Route path="trainer-dashboard" element={<TrainerDashboard  />} />
                <Route path="student-dashboard" element={<StudentDashboard />}/>
                <Route path="mentor-dashboard" element={<MentorDashboard/>} />
                <Route path="student-analytics/:assessmentId" element={<Analytics />} />
                <Route path="forum/" element={<Forum />} />

                <Route path="student-dashboard/:assessmentId" element={<Assessment  />} />
                <Route path="create-assessment" element={<AssessmentCreation />} />
            </Routes>
        </BrowserRouter>
        </UserProvider>
    );
}

export default App;

