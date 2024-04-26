import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import  {app,auth,db}  from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = async (e) => {
        e.preventDefault();
        try {
            const docRef = doc(db, "users", "SF")
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log(userCredential)
            const user = userCredential.user;
            console.log(user)
            // Retrieve user role from Firestore
            const q = query(collection(db, 'users'), where('uid', '==', user.uid));
            console.log("asdfghj")
            const querySnapshot = await getDocs(q);
            console.log("hrllo",querySnapshot)
            const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}
            querySnapshot.docs.forEach((doc) => {
                console.log("docd:",doc)
                const role = doc.data().role;
                console.log("role:",role)

                // Redirect user based on role
                switch (role) {
                    case 'Student':
                        navigate('/student-dashboard');
                        break;
                    case 'Aptitude Trainer':
                        navigate('/trainer-dashboard');
                        break;
                    case 'Class Mentor':
                        navigate('/mentor-dashboard');
                        break;
                    default:
                        break;
                }
            });
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorCode, errorMessage);
        }
    }

    return (
        <main>
            <section>
                <div>
                    <form>
                        <div>
                            <label htmlFor="email-address">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                            />
                        </div>

                        <button
                            type="submit"
                            onClick={onLogin}
                        >
                            Login
                        </button>
                    </form>

                    <p>
                        No account yet?{' '}
                        <NavLink to="/signup">
                            Sign up
                        </NavLink>
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Login;
