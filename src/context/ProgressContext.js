import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../services/firebase';
import { AuthContext } from '../components/Auth/AuthContext';

import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [allUsersProgress, setAllUsersProgress] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get all users' progress for leaderboard
  useEffect(() => {
    if (!currentUser) return;

    try {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(query(usersRef), (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          users.push({
            id: doc.id,
            name: userData.name || "Anonymous",
            progress: userData.progress || [],
            streak: userData.streak || 0,
            lastUpdated: userData.lastUpdated,
          });
        });
        setAllUsersProgress(users);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error getting users progress:", error);
      setIsLoading(false);
      return () => {};
    }
  }, [currentUser]);

  // Get current user's detailed progress
  useEffect(() => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserProgress(userData.progress || []);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error getting user progress:", error);
      return () => {};
    }
  }, [currentUser]);

  // Update module status
  const updateModuleStatus = async (moduleId, status) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentProgress = userData.progress || [];
        
        // Find if module already exists in progress
        const moduleIndex = currentProgress.findIndex(p => p.moduleId === moduleId);
        
        let newProgress = [...currentProgress];
        const today = new Date().toISOString();
        
        if (moduleIndex >= 0) {
          // Update existing module
          newProgress[moduleIndex] = {
            ...newProgress[moduleIndex],
            status,
            updatedAt: today
          };
        } else {
          // Add new module to progress
          newProgress.push({
            moduleId,
            status,
            startedAt: today,
            updatedAt: today
          });
        }
        
        // Update streak logic
        let streak = userData.streak || 0;
        const lastUpdatedDate = userData.lastUpdated ? new Date(userData.lastUpdated) : null;
        const currentDate = new Date();
        
        if (lastUpdatedDate) {
          const yesterday = new Date(currentDate);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastUpdatedDate.toDateString() === yesterday.toDateString()) {
            streak += 1;
          } else if (lastUpdatedDate.toDateString() !== currentDate.toDateString()) {
            streak = 1;
          }
        } else {
          streak = 1;
        }
        
        // Update user document
        await updateDoc(userDocRef, {
          progress: newProgress,
          streak,
          lastUpdated: today
        });
      }
    } catch (error) {
      console.error("Error updating module status:", error);
    }
  };

  const value = {
    allUsersProgress,
    userProgress,
    isLoading,
    updateModuleStatus,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;