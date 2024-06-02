import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Import the Firebase auth method
import { auth } from '../firebase';
const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      setUser(userAuth);
    });
    
    // Clean up the subscription
    return () => unsubscribe();
  }, []);
console.log("user",user)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
