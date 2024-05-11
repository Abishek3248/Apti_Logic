import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { app, auth, db } from '../../firebase';

// Material-UI components
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const SignupBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}));

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Student'); // Default role is Student

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        role: role,
        username: username
      });

      console.log(user);
      // navigate('/login');
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    }
  }

  return (
    <SignupBox>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Username"
          type="text"
          fullWidth
          margin="normal"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          select
          label="Role"
          fullWidth
          margin="normal"
          variant="outlined"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="Student">Student</MenuItem>
          <MenuItem value="Aptitude Trainer">Aptitude Trainer</MenuItem>
          <MenuItem value="Class Mentor">Class Mentor</MenuItem>
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Sign up
        </Button>
      </form>
      <Typography variant="body2" align="center" style={{ marginTop: 20 }}>
        Already have an account? <NavLink to="/login">Sign in</NavLink>
      </Typography>
    </SignupBox>
  );
}

export default Signup;


@media only screen and (max-width: 768px) {
  


  .assessment-card {
  
      width: 200px;
      height:350px;
      border-radius: 20px;
      background: #f5f5f5;
      position: relative;
      padding: 1.8rem;
      padding-top: 0;
      border: 2px solid #008bf8;
      transition: 0.5s ease-out;
      overflow:hidden;
      margin: 20px;
      color: #03045E;
  
     }
     
     .assessment-card-details {
      color: black;
      height: 100%;
      gap: .5em;
      display: grid;
      place-content: center;
      overflow: hidden;
     }
     
     .assessment-card-button1 {
      transform: translate(-50%, 125%);
      width: 35%;
      border-radius: 1rem;
      border: none;
      background-color: #008bf8;
      color: #fff;
      font-size: 1rem;
      padding: .5rem 1rem;
      position: absolute;
      left: 25%;
      bottom: 8%;
      opacity: 0;
      transition: 0.3s ease-out;
      text-decoration: none;
  
     }
     .assessment-card-button2 {
      transform: translate(-50%, 125%);
      width: 35%;
      border-radius: 1rem;
      border: none;
      background-color: #008bf8;
      color: #fff;
      font-size: 1rem;
      padding: .5rem 1rem;
      position: absolute;
      right: -22%;
      bottom: 8%;
      opacity: 0;
      transition: 0.3s ease-out;
      text-decoration: none;
     }
     
  
     .forum-button {
      border-radius: 1rem;
      border: none;
      background-color: #008bf8;
      color: #fff;
      font-size: 1rem;
      padding: .5rem 1rem;
      margin-left: 120px;
      transition: 0.3s ease-out;
      text-decoration: none;
     }
     
  
     .text-body {
      color: rgb(134, 134, 134);
     }
     
     /*Text*/
     .text-title {
      font-size: 1.5em;
      font-weight: bold;
     }
     
     /*Hover*/
     .trainer-assessment-card:hover {
      border-color: #008bf8;
      box-shadow: 0 40px 180px 0 rgb(48, 58, 169);
     }
     
     .trainer-assessment-card:hover  .assessment-card-button1, .assessment-card:hover  .assessment-card-button2 {
      transform: translate(-50%, 50%);
      opacity: 1;
     }
  
  
     .assessment-card-buttons{
      display: flex;
  
     }
  .student-dashboard-assessments{
    position: absolute;
      top: 30%;
      left: 10%;
      flex-direction: column;
  }
    
  
  .create-assessment-btn {
    position: fixed; /* Change to 'absolute' if you want it relative to a parent container */
    top: 20px; /* Adjust as needed */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Center horizontally */
    font-weight: bold;
    color: white;
    background-color: #00B4D8; /* Orange submit button color */
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 25px;
  }
  
  .create-assessment-btn:hover {
    color: #03045E;
    background-color: transparent; /* Darker orange on hover */
    border: 3px solid #03045E;
  }
  
  .student-dashboard-title{
   
      font-size: 2rem;
      font-family: "Luckiest Guy", cursive;
      color: #03045E;
      position: absolute;
      top: 1%;
      left: 18%;
  
   
  }
  
  }
  .available-assessment{
    font-family: "Luckiest Guy", cursive;
    color: #03045E;
  }