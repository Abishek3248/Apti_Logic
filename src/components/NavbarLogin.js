import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../pages/UserContext';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

const NavbarLogin = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white ml-2">AptiLogic</span>
        </a>
        <button 
          className="block lg:hidden focus:outline-none" 
          className={`${isMobileMenuOpen ? 'block lg:hidden focus:outline-none z-10' : 'block lg:hidden focus:outline-none'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
          {console.log(isMobileMenuOpen)}
        <div className={`${isMobileMenuOpen ? 'block absolute top-0 right-0' : 'hidden'} lg:hidden `}>
        {console.log(isMobileMenuOpen)}

          {user && (

            <div className="flex flex-col items-start space-y-4 mt-10">
              <span className="text-gray-700 dark:text-gray-200">Welcome, {user.username || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="hidden lg:flex lg:items-center lg:space-x-4">
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-200">Welcome, {user.username || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarLogin;
