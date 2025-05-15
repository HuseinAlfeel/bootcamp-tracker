import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../services/firebase';
import { AuthContext } from '../components/Auth/AuthContext';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query,
  arrayUnion
} from 'firebase/firestore';
import { courseModules, categories } from '../constants/courseData';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [allUsersProgress, setAllUsersProgress] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
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
          setUserAchievements(userData.achievements || []);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error getting user progress:", error);
      return () => {};
    }
  }, [currentUser]);

  // Calculate category completion stats
  const getCategoryStats = (categoryName, progress) => {
    const categoryModules = courseModules.filter(module => module.category === categoryName);
    if (!categoryModules.length) return { percentage: 0, completed: 0, total: 0 };
    
    const completedInCategory = progress.filter(p => 
      categoryModules.some(m => m.id === p.moduleId) && 
      p.status === 'completed'
    ).length;
    
    return {
      percentage: Math.round((completedInCategory / categoryModules.length) * 100),
      completed: completedInCategory,
      total: categoryModules.length
    };
  };
  
  // Calculate overall course completion percentage
  const calculateOverallCompletion = (progress) => {
    if (!progress || !progress.length) return 0;
    const completedModules = progress.filter(p => p.status === 'completed').length;
    return Math.round((completedModules / courseModules.length) * 100);
  };

  // Helper function to normalize category names for achievement IDs
  const normalizeForId = (categoryName) => {
    // Map specific category names to exact achievement IDs
    const categoryMap = {
      'Front-End Fundamentals': 'html_css',
      'JavaScript & DOM': 'js_dom',
      'Backend Development': 'backend',
      'Databases & Full Stack': 'database',
      'Advanced Topics': 'advanced'
    };
    
    // Return the mapped value or fallback to a simplified version of the name
    return categoryMap[categoryName] || 
           categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/__+/g, '_');
  };

  // Check for achievements
  const checkAndUnlockAchievements = async (progress, streak) => {
    if (!currentUser) return [];
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentAchievements = userData.achievements || [];
        const newAchievements = [];
        
        // Count completed modules
        const completedModules = progress.filter(p => p.status === 'completed').length;
        console.log(`Completed modules: ${completedModules}`);
        
        // First module completed
        if (completedModules >= 1 && !currentAchievements.includes('first_module')) {
          newAchievements.push('first_module');
          console.log('Achievement unlocked: first_module');
        }
        
        // 5 modules completed
        if (completedModules >= 5 && !currentAchievements.includes('five_modules')) {
          newAchievements.push('five_modules');
          console.log('Achievement unlocked: five_modules');
        }
        
        // 10 modules completed
        if (completedModules >= 10 && !currentAchievements.includes('ten_modules')) {
          newAchievements.push('ten_modules');
          console.log('Achievement unlocked: ten_modules');
        }
        
        // Streak achievements
        // 3-day streak
        if (streak >= 3 && !currentAchievements.includes('three_day_streak')) {
          newAchievements.push('three_day_streak');
          console.log('Achievement unlocked: three_day_streak');
        }
        
        // 7-day streak
        if (streak >= 7 && !currentAchievements.includes('seven_day_streak')) {
          newAchievements.push('seven_day_streak');
          console.log('Achievement unlocked: seven_day_streak');
        }
        
        // Process each category
        categories.forEach(category => {
          const stats = getCategoryStats(category.name, progress);
          const normalizedCategoryId = normalizeForId(category.name);
          
          console.log(`Category ${category.name} (${normalizedCategoryId}): ${stats.completed}/${stats.total} modules (${stats.percentage}%)`);
          
          // 50% achievement - Half of the modules completed
          const halfwayThreshold = Math.ceil(stats.total / 2); // Round up for odd numbers
          const isHalfComplete = stats.completed >= halfwayThreshold;
          
          if (isHalfComplete) {
            const halfwayAchievementId = `${normalizedCategoryId}_50`;
            if (!currentAchievements.includes(halfwayAchievementId)) {
              newAchievements.push(halfwayAchievementId);
              console.log(`Achievement unlocked: ${halfwayAchievementId} (${stats.completed}/${halfwayThreshold} modules)`);
            }
          }
          
          // 100% achievement - All modules completed
          if (stats.completed >= stats.total) {
            const completeAchievementId = `${normalizedCategoryId}_complete`;
            if (!currentAchievements.includes(completeAchievementId)) {
              newAchievements.push(completeAchievementId);
              console.log(`Achievement unlocked: ${completeAchievementId} (${stats.completed}/${stats.total} modules)`);
            }
          }
        });
        
        // Overall progress achievements
        const overallCompletion = calculateOverallCompletion(progress);
        console.log(`Overall completion: ${overallCompletion}%`);
        
        // 50% overall completion
        if (overallCompletion >= 50 && !currentAchievements.includes('halfway_course')) {
          newAchievements.push('halfway_course');
          console.log('Achievement unlocked: halfway_course');
        }
        
        // 75% overall completion
        if (overallCompletion >= 75 && !currentAchievements.includes('course_75')) {
          newAchievements.push('course_75');
          console.log('Achievement unlocked: course_75');
        }
        
        // 100% overall completion
        if (overallCompletion >= 100 && !currentAchievements.includes('course_complete')) {
          newAchievements.push('course_complete');
          console.log('Achievement unlocked: course_complete');
        }
        
        // If there are new achievements, update the user document
        if (newAchievements.length > 0) {
          console.log(`Adding ${newAchievements.length} new achievements: ${newAchievements.join(', ')}`);
          
          const updatedAchievements = [...currentAchievements, ...newAchievements];
          await updateDoc(userDocRef, {
            achievements: updatedAchievements
          });
          
          // Also update local state
          setUserAchievements(updatedAchievements);
          
          return newAchievements;
        }
        
        return [];
      }
      
      return [];
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  };

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
        
        // Check for achievements after progress is updated
        const newAchievements = await checkAndUnlockAchievements(newProgress, streak);
        
        // Return any new achievements unlocked
        return newAchievements;
      }
    } catch (error) {
      console.error("Error updating module status:", error);
      return [];
    }
  };
  
  // Force achievement check (useful for testing or if achievements didn't unlock properly)
  const forceAchievementCheck = async () => {
    if (!currentUser) return [];
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return await checkAndUnlockAchievements(
          userData.progress || [], 
          userData.streak || 0
        );
      }
      
      return [];
    } catch (error) {
      console.error("Error forcing achievement check:", error);
      return [];
    }
  };

  const value = {
    allUsersProgress,
    userProgress,
    userAchievements,
    isLoading,
    updateModuleStatus,
    checkAndUnlockAchievements,
    forceAchievementCheck  // Export for manual checking
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;