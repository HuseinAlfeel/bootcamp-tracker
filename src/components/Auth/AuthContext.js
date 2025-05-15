import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register function
  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          progress: [],
          streak: 0,
          lastUpdated: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          achievements: [],  // Add this field for achievements
          studySessions: [], // Add this field for study sessions
          totalStudyTime: 0  // Add this field for total study time
        });
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError);
      }
      
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login function with improved handling
  const login = async (email, password) => {
    console.log("Logging in with:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful with Firebase Auth");
      
      // Manually fetch user data to speed up the process
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            });
          } else {
            // User auth exists but no document - create one
            await setDoc(doc(db, "users", user.uid), {
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              progress: [],
              streak: 0,
              lastUpdated: new Date().toISOString(),
              joinDate: new Date().toISOString(),
              achievements: [],
              studySessions: [],
              totalStudyTime: 0
            });
            
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              progress: [],
              streak: 0,
              achievements: [],
              studySessions: [],
              totalStudyTime: 0
            });
          }
        } catch (error) {
          console.error("Error getting user document:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0]
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;