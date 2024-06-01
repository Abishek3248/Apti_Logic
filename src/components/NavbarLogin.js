import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../pages/UserContext';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

const NavbarLogin = () => {
  const { user } = useUser();
  const navigate = useNavigate();

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
        {console.log(user)}
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-200">Welcome, {user.username || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
            {/* <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="rounded-full w-10 h-10"
            /> */}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarLogin;
