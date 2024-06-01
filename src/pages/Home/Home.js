import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useUser } from "../UserContext";
import Carousal from "./Carousal";
import img1 from "./imgs/7618695.jpg"
import carousal1 from "./imgs/7618695.jpg"
import carousal2 from "./imgs/6342523.jpg"
import carousal3 from "./imgs/8426454_3918929.jpg"
import HomeSection from "./Carousal";
import Navbar from "../../components/Navbar";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Initially show login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Student"); // Default role is Student
  const { setUser } = useUser();
  const [error, setError] = useState("");

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setError(""); // Clear error when toggling the modal
  };

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      setUser(user);
      console.log(user);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        switch (userData.role) {
          case "Student":
            navigate("/student-dashboard");
            break;
          case "Aptitude Trainer":
            navigate("/trainer-dashboard");
            break;
          case "Class Mentor":
            navigate("/mentor-dashboard");
            break;
          default:
            break;
        }
      } else {
        setError("User data not found");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("User not found");
      } else if (error.code === "auth/wrong-password") {
        setError("Invalid credentials");
      } else {
        setError(error.message);
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        role: role,
        username: username,
      });

      console.log(user);
      toggleForm();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("User already exists");
      } else {
        setError(error.message);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(""); // Clear error when toggling the form
  };

  return (
    <>
      <div>
        {/* <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a
              href="/"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8"
                alt="Flowbite Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                AptiLogic
              </span>
            </a>
            <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
              <button
                onClick={toggleModal}
                data-modal-target="authentication-modal"
                data-modal-toggle="authentication-modal"
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
              >
                Login/Signup
              </button>

              <button
                data-collapse-toggle="navbar-sticky"
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="navbar-sticky"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </div>
            <div
              className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
              id="navbar-sticky"
            >
              <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <a
                    href="#home"
                    className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                    aria-current="page"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
   */}

       <Navbar/>
       <div id="home" className="pt-24 p-4 text-center">
      <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to AptiLogic</h1>
        <p className="mb-4 text-lg text-gray-600">
          Master Aptitude and Logical Reasoning Skills with Ease
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <img className="w-full h-96 object-cover" src={carousal1} alt="Aptitude and Logical Reasoning" />
      </div>
    </div>








<div id="about" className="bg-white dark:bg-gray-800 py-24 px-5 max-w-4xl mx-auto">

<div class="w-full p-4 text-center bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
    <h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">About Us</h5>
    <p class="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400"> 
    As developers at AptiLogic, we are driven by a shared passion for education and technology. We believe that mastering aptitude and logical reasoning skills is crucial for both academic and professional success. Our goal is to leverage our expertise in software development to create a platform that not only prepares students for assessments but also instills confidence and a love for learning. We understand the challenges students face, and we are dedicated to providing innovative solutions that make learning engaging and effective</p>
      <div class="items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">

   <div className="flex flex-wrap justify-center	">    
<div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
    <svg class="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
</div>
<div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
    <svg class="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
</div>
<div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
    <svg class="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
</div>
<div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
    <svg class="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
</div>
</div>
    </div>
   </div>
   
</div>

        <div id="services" className="pt-24 p-4 text-center ">
        <h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Services</h5>

        <div class="grid mb-8 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 md:mb-12 md:grid-cols-2 bg-white dark:bg-gray-800">
    <figure class="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e dark:bg-gray-800 dark:border-gray-700">
        <blockquote class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aptitude Training</h3>
            <p class="my-4">Comprehensive training modules designed to improve your aptitude skills.</p>
        </blockquote>
           
    </figure>
    <figure class="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 md:rounded-se-lg dark:bg-gray-800 dark:border-gray-700">
        <blockquote class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Mock Assessments</h3>
            <p class="my-4">Simulate real exam conditions with our timed mock assessments.</p>
        </blockquote>
        {/* <figcaption class="flex items-center justify-center">
            <img class="rounded-full w-9 h-9" src="https://via.placeholder.com/36" alt="service icon"/>
            <div class="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
                <div>AptiLogic</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Service</div>
            </div>
        </figcaption>     */}
    </figure>
    <figure class="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 md:rounded-es-lg md:border-b-0 md:border-e dark:bg-gray-800 dark:border-gray-700">
        <blockquote class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
            <p class="my-4">Detailed analytics to track your progress and identify areas for improvement.</p>
         </blockquote>
        {/* <figcaption class="flex items-center justify-center">
            <img class="rounded-full w-9 h-9" src="https://via.placeholder.com/36" alt="service icon"/>
            <div class="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
                <div>AptiLogic</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Service</div>
            </div>
        </figcaption>     */}
    </figure>
    <figure class="flex flex-col items-center justify-center p-8 text-center bg-white border-gray-200 rounded-b-lg md:rounded-se-lg dark:bg-gray-800 dark:border-gray-700">
        <blockquote class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Community Support</h3>
            <p class="my-4">Join our community forum to ask questions and share knowledge.</p>
        </blockquote>
        {/* <figcaption class="flex items-center justify-center">
            <img class="rounded-full w-9 h-9" src="https://via.placeholder.com/36" alt="service icon"/>
            <div class="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
                <div>AptiLogic</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Service</div>
            </div>
        </figcaption>     */}
    </figure>
</div>

    
        </div>

        <div id="contact" className="pt-24 p-4 mb-10">
          <h1 className="text-3xl font-bold mb-4 text-center">Contact Us</h1>
          <p className="text-center">
            Have questions or need support? Reach out to us at{" "}
            <a href="mailto:support@aptilogic.com" className="text-blue-600">
              support@aptilogic.com
            </a>
          </p>
        </div>

        {isModalOpen && (
          <div
            id="authentication-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full flex items-center justify-center"
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  onClick={toggleModal}
                  type="button"
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                  data-modal-hide="authentication-modal"
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="px-6 py-6 lg:px-8">
                  <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                    {isLogin ? "Sign in to" : "Sign up for"} AptiLogic
                  </h3>
                  <form className="space-y-6">
                    {!isLogin && (
                      <div>
                        <label
                          htmlFor="username"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Your username
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="johndoe"
                          required
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="name@company.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {!isLogin && (
                      <div>
                        <label
                          htmlFor="role"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Role
                        </label>
                        <select
                          id="role"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="Student">Student</option>
                          <option value="Aptitude Trainer">
                            Aptitude Trainer
                          </option>
                          <option value="Class Mentor">Class Mentor</option>
                        </select>
                      </div>
                    )}
                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}
                    <button
                      type="submit"
                      onClick={isLogin ? handleLogin : handleSignup}
                      className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      {isLogin ? "Sign in" : "Sign up"}
                    </button>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      {isLogin ? "Not registered?" : "Already registered?"}{" "}
                      <a
                        href="#"
                        className="text-blue-700 hover:underline dark:text-blue-500"
                        onClick={toggleForm}
                      >
                        {isLogin ? "Create account" : "Sign in"}
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;