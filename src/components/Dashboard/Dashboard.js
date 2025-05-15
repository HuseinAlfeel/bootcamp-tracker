import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import { ProgressContext } from '../../context/ProgressContext';
import { courseModules, categories } from '../../constants/courseData';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProgress, allUsersProgress, updateModuleStatus, userAchievements } = useContext(ProgressContext) || { 
    userProgress: [], 
    allUsersProgress: [],
    updateModuleStatus: () => console.log('updateModuleStatus not available'),
    userAchievements: []
  };
  
  // Track hover state for charts
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  
  // Function to get the number of modules completed by a user in the current week
  const getWeeklyCompletionCount = (userProgress) => {
    if (!userProgress || !userProgress.length) return 0;
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    return userProgress.filter(module => {
      return module.status === 'completed' && 
             module.updatedAt && 
             new Date(module.updatedAt) >= startOfWeek;
    }).length;
  };
  
  // Generate weekly data for all users
  const generateWeeklyData = () => {
    // If no other users, just show current user's data
    if (!allUsersProgress || allUsersProgress.length === 0) {
      return [
        {
          name: currentUser?.name || 'You',
          thisWeek: getWeeklyCompletionCount(userProgress),
          isCurrentUser: true
        }
      ];
    }
    
    // Create data for all users
    return allUsersProgress.map(user => ({
      name: user.name,
      thisWeek: getWeeklyCompletionCount(user.progress),
      isCurrentUser: user.id === currentUser?.uid
    })).sort((a, b) => b.thisWeek - a.thisWeek);
  };
  
  const weeklyData = generateWeeklyData();
  
  // Calculate completion percentage
  const calculateCompletion = (progress) => {
    if (!progress || progress.length === 0) return 0;
    const completedModules = progress.filter(p => p.status === 'completed').length;
    return Math.round((completedModules / courseModules.length) * 100);
  };

  // Calculate category completion percentages
  const calculateCategoryCompletion = (category) => {
    const categoryModules = courseModules.filter(m => m.category === category.name);
    if (!categoryModules.length) return 0;
    
    const completedInCategory = userProgress.filter(p => 
      categoryModules.some(m => m.id === p.moduleId) && 
      p.status === 'completed'
    ).length;
    
    return Math.round((completedInCategory / categoryModules.length) * 100);
  };
  
  // Generate leaderboard data
  const generateLeaderboard = () => {
    if (!allUsersProgress || allUsersProgress.length === 0) {
      return [{
        name: currentUser?.name || 'You',
        completion: calculateCompletion(userProgress),
        completedModules: userProgress.filter(p => p.status === 'completed').length,
        streak: currentUser?.streak || 0,
        isCurrentUser: true
      }];
    }
    
    return allUsersProgress.map(user => ({
      id: user.id,
      name: user.name,
      completion: calculateCompletion(user.progress),
      completedModules: user.progress.filter(p => p.status === 'completed').length,
      streak: user.streak || 0,
      isCurrentUser: user.id === currentUser?.uid
    })).sort((a, b) => b.completion - a.completion);
  };
  
  const leaderboardData = generateLeaderboard();
  
  // Calculate category completion
  const getCategoryCompletion = () => {
    const result = categories.map(category => {
      const categoryModules = courseModules.filter(module => module.category === category.name);
      const completedInCategory = userProgress.filter(p => 
        categoryModules.some(m => m.id === p.moduleId) && 
        p.status === 'completed'
      ).length;
      
      const total = categoryModules.length;
      const percentage = total > 0 ? Math.round((completedInCategory / total) * 100) : 0;
      
      return {
        name: category.name,
        color: category.color,
        completed: completedInCategory,
        total: total,
        percentage: percentage
      };
    });
    
    return result;
  };
  
  // Generate study hours data based on completed modules
  const generateStudyHoursData = () => {
    // Assuming 1.5 hours per completed module
    const HOURS_PER_MODULE = 1.5;
    
    // Create an array for the last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result = days.map(day => ({ day, hours: 0 }));
    
    // Count completed modules by day over the past week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    userProgress.forEach(module => {
      if (module.status === 'completed' && module.updatedAt) {
        const completedDate = new Date(module.updatedAt);
        const daysAgo = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
        
        // Only include if completed within the last 7 days
        if (daysAgo < 7) {
          const dayIndex = (dayOfWeek - daysAgo) % 7;
          const normalizedDayIndex = dayIndex < 0 ? dayIndex + 7 : dayIndex;
          // Map to the correct array index (Mon=0, Tue=1, ..., Sun=6)
          const arrayIndex = (normalizedDayIndex + 6) % 7;
          
          result[arrayIndex].hours += HOURS_PER_MODULE;
        }
      }
    });
    
    // Calculate total hours
    const totalHours = result.reduce((sum, day) => sum + day.hours, 0);
    
    return { dailyData: result, totalHours };
  };
  
  const { dailyData: studyHoursData, totalHours: weeklyStudyHours } = generateStudyHoursData();
  
  // Get next module to study
  const getNextModule = () => {
    const completedModuleIds = userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);
    
    const inProgressModuleIds = userProgress
      .filter(p => p.status === 'in-progress')
      .map(p => p.moduleId);
    
    // First check if there are modules in progress
    if (inProgressModuleIds.length > 0) {
      const moduleInProgress = courseModules.find(m => m.id === inProgressModuleIds[0]);
      return {
        id: moduleInProgress.id,
        title: moduleInProgress.title,
        status: 'in-progress'
      };
    }
    
    // If not, find the next module that hasn't been completed
    for (let i = 0; i < courseModules.length; i++) {
      if (!completedModuleIds.includes(courseModules[i].id)) {
        return {
          id: courseModules[i].id,
          title: courseModules[i].title,
          status: 'not-started'
        };
      }
    }
    
    // If all modules are completed
    return {
      id: courseModules[courseModules.length - 1].id,
      title: 'All modules completed! 🎉',
      status: 'completed'
    };
  };
  
  // Define expanded achievement list
  const allAchievements = [
    {
      id: 'first_module',
      title: 'First Steps',
      description: 'Completed your first module',
      icon: '🌱',
      color: '#4dff9d'
    },
    {
      id: 'five_modules',
      title: 'Getting Traction',
      description: 'Completed 5 modules',
      icon: '🚀',
      color: '#4d9aff'
    },
    {
      id: 'ten_modules',
      title: 'Serious Learner',
      description: 'Completed 10 modules',
      icon: '📚',
      color: '#c44dff'
    },
    {
      id: 'three_day_streak',
      title: 'Consistency Begins',
      description: 'Maintained a 3-day study streak',
      icon: '🔥',
      color: '#ff9d4d'
    },
    {
      id: 'seven_day_streak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day study streak',
      icon: '🏆',
      color: '#ffd700'
    },
    {
      id: 'html_css_50',
      title: 'HTML Apprentice',
      description: 'Reached 50% in Front-End Fundamentals',
      icon: '📝',
      color: '#FF5733'
    },
    {
      id: 'html_css_complete',
      title: 'CSS Stylist',
      description: 'Completed all Front-End Fundamentals modules',
      icon: '🎨',
      color: '#33B5FF'
    },
    {
      id: 'js_dom_50',
      title: 'Script Padawan',
      description: 'Reached 50% in JavaScript & DOM',
      icon: '⚙️',
      color: '#FFDD33'
    },
    {
      id: 'js_dom_complete',
      title: 'DOM Manipulator',
      description: 'Completed all JavaScript & DOM modules',
      icon: '🧩',
      color: '#33FF57'
    },
    {
      id: 'backend_50',
      title: 'Server Novice',
      description: 'Reached 50% in Backend Development',
      icon: '🔌',
      color: '#8A33FF'
    },
    {
      id: 'backend_complete',
      title: 'API Architect',
      description: 'Completed all Backend Development modules',
      icon: '🏗️',
      color: '#FF33A8'
    },
    {
      id: 'database_50',
      title: 'Data Collector',
      description: 'Reached 50% in Databases & Full Stack',
      icon: '💾',
      color: '#33FFC1'
    },
    {
      id: 'database_complete',
      title: 'Full Stack Engineer',
      description: 'Completed all Databases & Full Stack modules',
      icon: '🔄',
      color: '#C133FF'
    },
    {
      id: 'advanced_50',
      title: 'Advanced Explorer',
      description: 'Reached 50% in Advanced Topics',
      icon: '🔍',
      color: '#FF3333'
    },
    {
      id: 'advanced_complete',
      title: 'Technology Master',
      description: 'Completed all Advanced Topics modules',
      icon: '🧠',
      color: '#33FFEC'
    },
    {
      id: 'halfway_course',
      title: 'Halfway Hero',
      description: 'Completed 50% of the entire course',
      icon: '🏄',
      color: '#FFA533'
    },
    {
      id: 'course_75',
      title: 'Almost There',
      description: 'Completed 75% of the entire course',
      icon: '🏂',
      color: '#33FFA8'
    },
    {
      id: 'course_complete',
      title: 'Coding Champion',
      description: 'Completed the entire bootcamp',
      icon: '👑',
      color: '#FFD700'
    }
  ];
  
  // Filter achievements based on unlocked status
  const unlockedAchievements = allAchievements.filter(achievement => 
    userAchievements && userAchievements.includes(achievement.id)
  );
  
  const displayedAchievements = showAllAchievements ? allAchievements : unlockedAchievements;
  
  // Generate milestone based on completion percentage - EXPANDED WITH MORE DETAILED TITLES
  const getMilestone = (completion) => {
    // Overall course completion titles
    if (completion >= 100) return { title: "Full Stack Master! 🎓", description: "You've mastered all aspects of web development. Congratulations on completing the bootcamp!" };
    if (completion >= 90) return { title: "Code Virtuoso! 🥇", description: "You're at an expert level with only a few concepts left to master!" };
    if (completion >= 75) return { title: "Backend Developer! 💻", description: "You've mastered backend development concepts and are well on your way to full stack mastery!" };
    if (completion >= 60) return { title: "Framework Fluent! 🛠️", description: "You've gained proficiency with frameworks and advanced programming techniques!" };
    if (completion >= 50) return { title: "JavaScript Ninja! ⚡", description: "You're skilled with JavaScript and DOM manipulation, a core skill for any web developer!" };
    if (completion >= 40) return { title: "Function Aficionado! 🧮", description: "You've mastered functions, objects, and the core building blocks of programming!" };
    if (completion >= 25) return { title: "HTML/CSS Wizard! 🧙‍♂️", description: "You've learned the fundamentals of web design and can create structured, styled pages!" };
    if (completion >= 15) return { title: "Markup Enthusiast! 🎯", description: "You're getting comfortable with HTML and beginning to understand web structures!" };
    if (completion >= 5) return { title: "Code Explorer! 🔍", description: "You've started your journey and taken the first steps into the world of coding!" };
    return { title: "Just Getting Started! 🌱", description: "Keep going! You're on the path to becoming a developer!" };
  };

  // Get the milestone title based on category completion
  const getCategoryMilestone = (category, percentage) => {
    const titles = {
      'Front-End Fundamentals': [
        { threshold: 100, title: "UI/UX Designer 🎨" },
        { threshold: 75, title: "CSS Specialist 🖌️" },
        { threshold: 50, title: "Layout Artist 🖼️" },
        { threshold: 25, title: "HTML Structurer 📝" },
        { threshold: 0, title: "Web Beginner 🌐" }
      ],
      'JavaScript & DOM': [
        { threshold: 100, title: "DOM Wizard 🧙‍♂️" },
        { threshold: 75, title: "Event Master 🎮" },
        { threshold: 50, title: "Function Guru ⚙️" },
        { threshold: 25, title: "Script Writer 📜" },
        { threshold: 0, title: "Logic Learner 🧩" }
      ],
      'Backend Development': [
        { threshold: 100, title: "API Architect 🏗️" },
        { threshold: 75, title: "Server Expert 🖥️" },
        { threshold: 50, title: "Route Navigator 🧭" },
        { threshold: 25, title: "Backend Explorer 🔍" },
        { threshold: 0, title: "Server Novice 🔌" }
      ],
      'Databases & Full Stack': [
        { threshold: 100, title: "Data Maestro 💾" },
        { threshold: 75, title: "Query Craftsman 📊" },
        { threshold: 50, title: "Schema Designer 📐" },
        { threshold: 25, title: "Data Modeler 📋" },
        { threshold: 0, title: "Database Beginner 📁" }
      ],
      'Advanced Topics': [
        { threshold: 100, title: "Tech Innovator 🚀" },
        { threshold: 75, title: "Framework Guru 🛠️" },
        { threshold: 50, title: "Performance Optimizer ⚡" },
        { threshold: 25, title: "Advanced Thinker 🧠" },
        { threshold: 0, title: "Curious Explorer 🔭" }
      ]
    };
    
    // Default titles if category not found
    const defaultTitles = [
      { threshold: 100, title: "Master 🏆" },
      { threshold: 75, title: "Expert 🥇" },
      { threshold: 50, title: "Practitioner 🔧" },
      { threshold: 25, title: "Apprentice 📚" },
      { threshold: 0, title: "Beginner 🌱" }
    ];
    
    const categoryTitles = titles[category] || defaultTitles;
    
    // Find the highest threshold that the percentage exceeds
    for (const title of categoryTitles) {
      if (percentage >= title.threshold) {
        return title.title;
      }
    }
    
    return defaultTitles[defaultTitles.length - 1].title;
  };

  // Get data for display
  const userCompletion = calculateCompletion(userProgress);
  const categoryCompletion = getCategoryCompletion();
  const nextModule = getNextModule();
  const currentMilestone = getMilestone(userCompletion);
  
  // Random motivational quotes
  const quotes = [
    "The only way to learn a new programming language is by writing programs in it.",
    "The expert in anything was once a beginner.",
    "Code is like humor. When you have to explain it, it's bad.",
    "First, solve the problem. Then, write the code.",
    "Programming isn't about what you know; it's about what you can figure out."
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Format module start/mark complete buttons
  const handleModuleAction = (moduleId, status) => {
    // Call the update function with the new status
    const newStatus = status === 'in-progress' ? 'completed' : 'in-progress';
    console.log(`Setting module ${moduleId} to ${newStatus}`);
    updateModuleStatus(moduleId, newStatus);
  };
  
  // Define common styles for reuse
  const styles = {
    pageContainer: {
      width: '100%', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#1e1e1e', 
      minHeight: 'calc(100vh - 70px)', 
      color: '#e0e0e0',
      borderRadius: '0px',
      maxWidth: '1200px'
    },
    pageTitle: {
      fontSize: '2rem', 
      marginBottom: '20px', 
      color: '#ffffff', 
      textAlign: 'center',
      fontWeight: '700'
    },
    welcomeBanner: {
      backgroundColor: '#2c2c2c', 
      padding: '20px', 
      borderRadius: '10px', 
      textAlign: 'center',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
      border: '1px solid #3c3c3c'
    },
    welcomeTitle: {
      margin: '0',
      fontSize: '1.5rem',
      color: '#ffffff'
    },
    welcomeQuote: {
      color: '#b3b3b3',
      fontStyle: 'italic',
      margin: '10px 0 0'
    },
    cardsContainer: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      backgroundColor: '#2c2c2c', 
      borderRadius: '10px', 
      padding: '20px', 
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      border: '1px solid #3c3c3c'
    },
    cardTitle: {
      marginTop: '0',
      color: '#ffffff',
      fontSize: '1.25rem',
      marginBottom: '15px'
    },
    progressValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4d9aff',
      marginBottom: '15px'
    },
    progressBar: {
      width: '100%', 
      height: '10px', 
      backgroundColor: '#3c3c3c', 
      borderRadius: '5px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    progressFill: (percentage, color = '#4d9aff') => ({
      width: `${percentage}%`, 
      height: '100%', 
      backgroundColor: color, 
      borderRadius: '5px',
      transition: 'width 0.5s ease-in-out'
    }),
    infoBox: (bgColor, borderColor) => ({
      backgroundColor: bgColor, 
      padding: '15px', 
      borderRadius: '8px',
      borderLeft: `4px solid ${borderColor}`,
      marginTop: '10px'
    }),
    infoTitle: (color) => ({
      fontWeight: 'bold',
      color: color
    }),
    infoText: {
      margin: '5px 0 0',
      color: '#b3b3b3',
      fontSize: '0.9rem'
    },
    actionButton: (bgColor) => ({
      backgroundColor: bgColor,
      color: 'white',
      border: 'none',
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      fontSize: '1rem'
    }),
    streakContainer: {
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: '20px',
      marginBottom: '20px'
    },
    streakValue: (streak) => ({
      fontSize: '3.5rem',
      fontWeight: 'bold',
      color: streak >= 3 ? '#ff9d4d' : '#8a8a8a',
      display: 'flex',
      alignItems: 'center'
    }),
    streakLabel: {
      fontSize: '1.1rem',
      color: '#b3b3b3',
      marginTop: '5px'
    },
    weeklyContainer: {
      backgroundColor: '#2c2c2c', 
      borderRadius: '10px', 
      padding: '20px', 
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      marginBottom: '30px',
      border: '1px solid #3c3c3c'
    },
    weeklyBars: {
      display: 'flex',
      justifyContent: 'center',
      height: '200px',
      alignItems: 'flex-end',
      marginTop: '20px',
      gap: '30px'
    },
    weeklyBar: {
      flex: '1 0 auto',
      maxWidth: '100px',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 10px'
    },
    weeklyBarFill: (height, isCurrentUser) => ({
      width: '100%', 
      height: `${height}px`, 
      backgroundColor: isCurrentUser ? '#4d9aff' : '#4f4f4f',
      borderRadius: '6px 6px 0 0',
      minHeight: '20px',
      transition: 'height 0.5s ease-in-out'
    }),
    weeklyBarLabel: {
      padding: '10px',
      color: '#b3b3b3',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginTop: '5px',
      width: '100%'
    },
    categoryGrid: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '15px'
    },
    categoryCard: {
      backgroundColor: '#323232', 
      borderRadius: '8px', 
      padding: '15px',
      border: '1px solid #3c3c3c'
    },
    categoryHeader: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '10px'
    },
    categoryTitle: {
      fontWeight: '600',
      color: '#ffffff'
    },
    categoryBadge: (color) => ({
      backgroundColor: color, 
      color: 'white', 
      padding: '4px 10px', 
      borderRadius: '12px', 
      fontSize: '0.75rem',
      fontWeight: '600'
    }),
    categoryStats: {
      fontSize: '0.85rem',
      color: '#b3b3b3'
    },
    leaderboardTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    },
    leaderboardHeader: {
      textAlign: 'left',
      padding: '10px 15px',
      backgroundColor: '#323232',
      color: '#e0e0e0',
      fontWeight: '600',
      borderBottom: '1px solid #444'
    },
    leaderboardCell: (isCurrentUser) => ({
      padding: '12px 15px',
      borderBottom: '1px solid #3c3c3c',
      backgroundColor: isCurrentUser ? 'rgba(77, 154, 255, 0.1)' : 'transparent'
    }),
    rankBadge: (rank) => {
      let color, emoji;
      
      switch(rank) {
        case 1:
          color = '#ffd700'; // Gold
          emoji = '🏆';
          break;
        case 2:
          color = '#c0c0c0'; // Silver
          emoji = '🥈';
          break;
        case 3:
          color = '#cd7f32'; // Bronze
          emoji = '🥉';
          break;
        default:
          color = '#718096';
          emoji = '';
      }
      
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        backgroundColor: `${color}20`,
        color: color,
        borderRadius: '4px',
        fontWeight: '600',
        border: `1px solid ${color}`
      };
    },
    analyticsSummary: {
      backgroundColor: 'rgba(77, 154, 255, 0.1)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      borderLeft: '4px solid #4d9aff'
    },
    summaryText: {
      color: '#e0e0e0',
      fontSize: '0.95rem'
    },
    highlightText: {
      color: '#4d9aff',
      fontWeight: '600'
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: 'rgba(40, 40, 40, 0.95)',
      color: '#fff',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid #4d9aff',
      zIndex: 10,
      fontSize: '0.85rem',
      pointerEvents: 'none'
    },
    achievementContainer: {
      marginTop: '10px',
      marginBottom: '20px'
    },
    achievementHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    achievementTitle: {
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    toggleButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4d9aff',
      cursor: 'pointer',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease'
    },
    achievementGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px'
    },
    achievementCard: (unlocked, color) => ({
      backgroundColor: unlocked ? '#2c2c2c' : 'rgba(44, 44, 44, 0.5)',
      borderRadius: '8px',
      padding: '15px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      boxShadow: unlocked ? '0 4px 6px rgba(0,0,0,0.2)' : 'none',
      border: unlocked ? `2px solid ${color}` : '2px solid #3c3c3c',
      opacity: unlocked ? 1 : 0.7,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }),
    achievementIcon: {
      fontSize: '2rem',
      marginBottom: '5px'
    },
    achievementCardTitle: {
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '2px',
      lineHeight: '1.2'
    },
    achievementDescription: {
      color: '#b3b3b3',
      fontSize: '0.8rem',
      lineHeight: '1.2'
    },
achievementCounter: {
     color: '#b3b3b3',
     fontSize: '0.9rem',
     marginTop: '10px',
     textAlign: 'center'
   },
   lockedOverlay: {
     backgroundColor: 'rgba(0, 0, 0, 0.7)',
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     borderRadius: '8px',
     display: 'flex',
     justifyContent: 'center',
     alignItems: 'center'
   },
   lockIcon: {
     color: '#ffffff',
     fontSize: '1.5rem'
   },
   achievementProgress: {
     fontSize: '0.8rem',
     color: '#999',
     marginTop: '5px'
   },
   categorySubTitle: {
     fontSize: '0.85rem',
     color: '#b3b3b3',
     fontWeight: 'normal',
     marginTop: '3px'
   }
 };
 
 // Calculate max value for weekly chart
 const maxWeeklyValue = Math.max(...weeklyData.map(user => user.thisWeek), 1);
 const chartScale = 150; // Maximum chart height in pixels
 
 return (
   <div style={{
     backgroundColor: '#1e1e1e',
     width: '100%',
     margin: 0,
     padding: 0,
     minHeight: 'calc(100vh - 70px)'
   }}>
     <div style={styles.pageContainer}>
       <h1 style={styles.pageTitle}>
         Web Development Bootcamp Tracker
       </h1>
       
       {/* Welcome Banner */}
       <div style={styles.welcomeBanner}>
         <h2 style={styles.welcomeTitle}>Welcome, {currentUser?.name || 'User'}!</h2>
         <p style={styles.welcomeQuote}>"{randomQuote}"</p>
       </div>
       
       {/* Main Dashboard Cards */}
       <div style={styles.cardsContainer}>
         {/* Overall Progress Card */}
         <div style={styles.card}>
           <h3 style={styles.cardTitle}>Overall Progress</h3>
           <div style={styles.progressValue}>
             {userCompletion}%
           </div>
           <div style={styles.progressBar}>
             <div style={styles.progressFill(userCompletion)} />
           </div>
           <div style={styles.infoBox('#213547', '#4d9aff')}>
             <div style={styles.infoTitle('#4d9aff')}>{currentMilestone.title}</div>
             <p style={styles.infoText}>{currentMilestone.description}</p>
           </div>
         </div>
         
         {/* Current Streak Card */}
         <div style={styles.card}>
           <h3 style={styles.cardTitle}>Current Streak</h3>
           <div style={styles.streakContainer}>
             <div style={styles.streakValue(currentUser?.streak || 0)}>
               {currentUser?.streak || 0} {currentUser?.streak >= 3 && '🔥'}
             </div>
             <div style={styles.streakLabel}>days</div>
           </div>
           <div style={styles.infoBox('#352918', '#ff9d4d')}>
             <p style={{...styles.infoText, textAlign: 'center', color: '#ffcc99'}}>
               {currentUser?.streak >= 3 
                 ? "You're on fire! Keep the momentum going!" 
                 : "Study consistently to build your streak!"}
             </p>
           </div>
         </div>
         
         {/* Next Module Card */}
         <div style={styles.card}>
           <h3 style={styles.cardTitle}>Next Module</h3>
           <div style={
             styles.infoBox(
               nextModule.status === 'in-progress' ? '#352918' : '#18352a',
               nextModule.status === 'in-progress' ? '#ff9d4d' : '#4dff9d'
             )
           }>
             <div style={
               styles.infoTitle(
                 nextModule.status === 'in-progress' ? '#ffcc99' : '#99ffcc'
               )
             }>
               {nextModule.status === 'in-progress' ? 'Currently Learning:' : 'Next Up:'}
             </div>
             <div style={{color: '#e6e6e6', marginTop: '5px'}}>{nextModule.title}</div>
           </div>
           <div style={{marginTop: '20px'}}>
             <button 
               onClick={() => handleModuleAction(nextModule.id, nextModule.status)}
               style={
                 styles.actionButton(
                   nextModule.status === 'in-progress' ? '#4dff9d' : '#4d9aff'
                 )
               }
               onMouseOver={(e) => {
                 e.currentTarget.style.transform = 'translateY(-2px)';
                 e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
               }}
               onMouseOut={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
               }}
             >
               {nextModule.status === 'in-progress' ? 'Mark as Completed' : 'Start Module'}
             </button>
           </div>
         </div>
       </div>
       
       {/* Achievements - EXPANDED */}
       <div style={styles.weeklyContainer}>
         <div style={styles.achievementHeader}>
           <h3 style={styles.achievementTitle}>Your Achievements</h3>
           <button 
             style={styles.toggleButton}
             onClick={() => setShowAllAchievements(!showAllAchievements)}
             onMouseOver={(e) => {
               e.currentTarget.style.backgroundColor = 'rgba(77, 154, 255, 0.1)';
             }}
             onMouseOut={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
             }}
           >
             {showAllAchievements ? 'Show Unlocked Only' : 'Show All Achievements'}
           </button>
         </div>
         
         <div style={styles.achievementGrid}>
           {displayedAchievements.map((achievement) => {
             const isUnlocked = userAchievements && userAchievements.includes(achievement.id);
             
             return (
               <div 
                 key={achievement.id} 
                 style={styles.achievementCard(isUnlocked, achievement.color)}
                 onMouseOver={(e) => {
                   if (isUnlocked) {
                     e.currentTarget.style.transform = 'translateY(-3px)';
                     e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (isUnlocked) {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                   }
                 }}
               >
                 <div style={styles.achievementIcon}>{achievement.icon}</div>
                 <div style={styles.achievementCardTitle}>{achievement.title}</div>
                 <div style={styles.achievementDescription}>{achievement.description}</div>
                 
                 {!isUnlocked && (
                   <div style={styles.achievementProgress}>
                     🔒 Not yet unlocked
                   </div>
                 )}
               </div>
             );
           })}
         </div>
         
         <div style={styles.achievementCounter}>
           {unlockedAchievements.length} / {allAchievements.length} achievements unlocked
         </div>
       </div>

       {/* Weekly Progress Chart */}
       <div style={styles.weeklyContainer}>
         <h3 style={styles.cardTitle}>This Week's Progress</h3>
         
         {/* Weekly bars */}
         <div style={styles.weeklyBars}>
           {weeklyData.map((user, index) => (
             <div key={index} style={styles.weeklyBar}>
               <div style={{
                 ...styles.weeklyBarFill(
                   (user.thisWeek / maxWeeklyValue) * chartScale,
                   user.isCurrentUser
                 ),
                 backgroundColor: user.isCurrentUser ? '#4d9aff' : 
                                  index === 0 ? '#4dff9d' : 
                                  index === 1 ? '#ff9d4d' : '#4f4f4f'
               }} />
               <div style={styles.weeklyBarLabel}>
                 <div style={{ 
                   color: user.isCurrentUser ? '#ffffff' : '#b3b3b3', 
                   fontWeight: user.isCurrentUser ? '600' : '400',
                   whiteSpace: 'nowrap',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   maxWidth: '100px'
                 }}>
                   {user.name} {user.isCurrentUser && '(You)'}
                 </div>
                 <div style={{ 
                   color: user.isCurrentUser ? '#ffffff' : '#b3b3b3', 
                   fontWeight: user.isCurrentUser ? '600' : '400',
                   marginTop: '2px'
                 }}>
                   {user.thisWeek} {user.thisWeek === 1 ? 'module' : 'modules'}
                 </div>
               </div>
             </div>
           ))}
         </div>
         
         <div style={{ textAlign: 'center', marginTop: '20px', color: '#b3b3b3' }}>
           {weeklyData.length <= 1 ? 
             "Invite your teammates to join and track their progress!" : 
             `${weeklyData[0].name} is leading this week with ${weeklyData[0].thisWeek} modules completed!`
           }
         </div>
       </div>

       {/* Leaderboard */}
       <div style={styles.weeklyContainer}>
         <h3 style={styles.cardTitle}>Leaderboard</h3>
         <table style={styles.leaderboardTable}>
           <thead>
             <tr>
               <th style={styles.leaderboardHeader}>Rank</th>
               <th style={styles.leaderboardHeader}>Name</th>
               <th style={styles.leaderboardHeader}>Progress</th>
               <th style={styles.leaderboardHeader}>Modules Completed</th>
               <th style={styles.leaderboardHeader}>Streak</th>
             </tr>
           </thead>
           <tbody>
             {leaderboardData.map((user, index) => (
               <tr key={index}>
                 <td style={styles.leaderboardCell(user.isCurrentUser)}>
                   <span style={styles.rankBadge(index + 1)}>
                     {index < 3 ? ['🏆', '🥈', '🥉'][index] : (index + 1)}
                   </span>
                 </td>
                 <td style={{...styles.leaderboardCell(user.isCurrentUser), fontWeight: user.isCurrentUser ? '600' : '400'}}>
                   {user.name} {user.isCurrentUser && '(You)'}
                 </td>
                 <td style={styles.leaderboardCell(user.isCurrentUser)}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span>{user.completion}%</span>
                     <div style={{ flex: 1, ...styles.progressBar, margin: 0 }}>
                       <div style={styles.progressFill(user.completion)} />
                     </div>
                   </div>
                 </td>
                 <td style={styles.leaderboardCell(user.isCurrentUser)}>
                   {user.completedModules}/{courseModules.length}
                 </td>
                 <td style={styles.leaderboardCell(user.isCurrentUser)}>
                   <span style={{ color: user.streak >= 3 ? '#ff9d4d' : '#8a8a8a' }}>
                     {user.streak} days {user.streak >= 3 && '🔥'}
                   </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
       
       {/* Learning Analytics */}
       <div style={styles.weeklyContainer}>
         <h3 style={styles.cardTitle}>
           <span style={{ marginRight: '10px' }}>📊</span>
           Learning Analytics
         </h3>
         
         <div style={styles.analyticsSummary}>
           <p style={styles.summaryText}>
             You've studied for <span style={styles.highlightText}>{weeklyStudyHours.toFixed(1)} hours</span> in the last week. 
             Consistent daily practice, even in short sessions, is key to mastering programming skills.
           </p>
         </div>
         
         {/* Daily Study Hours Chart */}
         <div style={{ marginTop: '20px' }}>
           <div style={{ marginBottom: '10px', color: '#ffffff', fontSize: '1.1rem' }}>
             Daily Study Hours (Last Week)
           </div>
           
           <div style={{ 
             height: '300px', 
             backgroundColor: '#272727',
             borderRadius: '8px', 
             padding: '20px', 
             position: 'relative',
             border: '1px solid #3c3c3c',
             overflow: 'hidden'
           }}>
             {/* Y-axis labels */}
             <div style={{ 
               position: 'absolute',
               left: '10px',
               top: 0,
               bottom: '30px',
               width: '30px',
               display: 'flex',
               flexDirection: 'column-reverse',
               justifyContent: 'space-between',
               paddingTop: '10px',
               paddingBottom: '10px'
             }}>
               {[0, 0.75, 1.5, 2.25, 3].map(value => (
                 <div key={value} style={{ color: '#999', fontSize: '0.8rem' }}>{value}</div>
               ))}
             </div>
             
             {/* Grid lines */}
             <div style={{ 
               position: 'absolute',
               left: '50px',
               right: '20px',
               top: '10px',
               bottom: '30px',
               display: 'flex',
               flexDirection: 'column-reverse',
               justifyContent: 'space-between'
             }}>
               {[0, 0.75, 1.5, 2.25, 3].map((value, i) => (
                 <div key={i} style={{ 
                   width: '100%', 
                   borderBottom: i === 0 ? '1px solid #444' : '1px dashed #333',
                   height: 0
                 }} />
               ))}
             </div>

             {/* Interactive hover areas */}
             <div style={{
               position: 'absolute',
               left: '50px',
               right: '20px',
               top: '10px',
               bottom: '30px',
               display: 'flex',
               justifyContent: 'space-between',
               zIndex: 3
             }}>
               {studyHoursData.map((day, i) => (
                 <div 
                   key={i}
                   style={{
                     height: '100%',
                     flex: 1,
                     cursor: 'pointer'
                   }}
                   onMouseEnter={() => setHoveredDay(i)}
                   onMouseLeave={() => setHoveredDay(null)}
                 />
               ))}
             </div>
             
             {/* Hover tooltips */}
             {hoveredDay !== null && (
               <div style={{
                 ...styles.tooltip,
                 left: `${50 + (hoveredDay * (100 - 70) / (studyHoursData.length - 1)) + 35}px`, // Adjust 35px for better positioning
                 top: '40px'
               }}>
                 <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                   {studyHoursData[hoveredDay].day}
                 </div>
                 <div>
                   Hours: <span style={{ color: '#ff9d4d', fontWeight: 'bold' }}>
                     {studyHoursData[hoveredDay].hours.toFixed(1)}
                   </span>
                 </div>
                 {studyHoursData[hoveredDay].hours > 0 && (
                   <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#aaa' }}>
                     ({(studyHoursData[hoveredDay].hours / 1.5).toFixed(0)} modules)
                   </div>
                 )}
               </div>
             )}

             {/* SVG for smooth line chart */}
             <svg 
               style={{ 
                 position: 'absolute',
                 left: '50px',
                 right: '20px',
                 top: '10px',
                 bottom: '30px',
                 width: 'calc(100% - 70px)',
                 height: 'calc(100% - 40px)',
                 overflow: 'visible'
               }}
               viewBox="0 0 6 3"
               preserveAspectRatio="none"
             >
               {/* Chart area background */}
               <rect
                 x="0" y="0" width="6" height="3"
                 fill="transparent"
               />
               
               {/* Create smooth curve */}
               <path
                 d={`
                   M 0 ${3 - Math.min(studyHoursData[0].hours, 2.99)}
                   ${studyHoursData.slice(1).map((point, i) => {
                     // Control points for smooth bezier curves
                     const prevX = i;
                     const prevY = 3 - Math.min(studyHoursData[i].hours, 2.99);
                     const currX = i + 1;
                     const currY = 3 - Math.min(point.hours, 2.99);
                     
                     // Calculate control points
                     const cp1x = prevX + 0.5;
                     const cp1y = prevY;
                     const cp2x = currX - 0.5;
                     const cp2y = currY;
                     
                     return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
                   }).join(' ')}
                 `}
                 fill="none"
                 stroke="#ff9d4d"
                 strokeWidth="0.03"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
               
               {/* Area under the curve with gradient */}
               <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#ff9d4d" stopOpacity="0.4" />
                 <stop offset="100%" stopColor="#ff9d4d" stopOpacity="0.05" />
               </linearGradient>
               
               <path
                 d={`
                   M 0 ${3 - Math.min(studyHoursData[0].hours, 2.99)}
                   ${studyHoursData.slice(1).map((point, i) => {
                     // Control points for smooth bezier curves
                     const prevX = i;
                     const prevY = 3 - Math.min(studyHoursData[i].hours, 2.99);
                     const currX = i + 1;
                     const currY = 3 - Math.min(point.hours, 2.99);
                     
                     // Calculate control points
                     const cp1x = prevX + 0.5;
                     const cp1y = prevY;
                     const cp2x = currX - 0.5;
                     const cp2y = currY;
                     
                     return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
                   }).join(' ')}
                   L 6 3
                   L 0 3
                   Z
                 `}
                 fill="url(#areaGradient)"
                 stroke="none"
               />
               
               {/* Data points */}
               {studyHoursData.map((point, i) => (
                 <circle
                   key={i}
                   cx={i}
                   cy={3 - Math.min(point.hours, 2.99)}
                   r={hoveredDay === i ? "0.08" : "0.05"}
                   fill={hoveredDay === i ? "#ffffff" : "#ff9d4d"}
                   stroke={hoveredDay === i ? "#ff9d4d" : "none"}
                   strokeWidth="0.02"
                 />
               ))}
             </svg>
             
             {/* X-axis labels */}
             <div style={{ 
               position: 'absolute',
               left: '50px',
               right: '20px',
               bottom: '5px',
               display: 'flex',
               justifyContent: 'space-between'
             }}>
               {studyHoursData.map((day, i) => (
                 <div 
                   key={i} 
                   style={{ 
                     color: hoveredDay === i ? '#ffffff' : '#999', 
                     fontSize: '0.8rem',
                     fontWeight: hoveredDay === i ? 'bold' : 'normal'
                   }}
                 >
                   {day.day}
                 </div>
               ))}
             </div>
           </div>
           
           {/* Legend */}
           <div style={{ 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             marginTop: '15px',
             color: '#b3b3b3'
           }}>
             <div style={{ 
               width: '20px', 
               height: '3px', 
               backgroundColor: '#ff9d4d', 
               marginRight: '8px' 
             }} />
             <span>Study Hours</span>
           </div>
         </div>
       </div>
         
       {/* Category Progress Section - WITH SKILL TITLES */}
       <div style={styles.weeklyContainer}>
         <h3 style={styles.cardTitle}>Progress by Category</h3>
         <div style={styles.categoryGrid}>
           {categoryCompletion.map((category, index) => {
             const categoryTitle = getCategoryMilestone(category.name, category.percentage);
             
             return (
               <div 
                 key={index} 
                 style={styles.categoryCard}
                 onMouseEnter={() => setHoveredCategory(index)}
                 onMouseLeave={() => setHoveredCategory(null)}
               >
                 <div style={styles.categoryHeader}>
                   <div>
                     <div style={styles.categoryTitle}>{category.name}</div>
                     {category.percentage > 0 && (
                       <div style={styles.categorySubTitle}>{categoryTitle}</div>
                     )}
                   </div>
                   <div style={styles.categoryBadge(category.color)}>
                     {category.percentage}%
                   </div>
                 </div>
                 <div style={styles.progressBar}>
                   <div style={styles.progressFill(category.percentage, category.color)} />
                 </div>
                 <div style={styles.categoryStats}>
                   {category.completed}/{category.total} modules completed
                 </div>
                 
                 {/* Hover tooltip */}
                 {hoveredCategory === index && category.percentage > 0 && (
                   <div style={{
                     ...styles.tooltip,
                     left: '50%',
                     transform: 'translateX(-50%)',
                     bottom: 'calc(100% + 10px)',
                     minWidth: '200px',
                     textAlign: 'center'
                   }}>
                     <div style={{ fontWeight: 'bold', marginBottom: '5px', color: category.color }}>
                       {categoryTitle}
                     </div>
                     <div style={{ fontSize: '0.85rem' }}>
                       {category.percentage >= 100 
                         ? `Congratulations on completing all ${category.name} modules!` 
                         : `Keep going to reach the next level: ${
                             getCategoryMilestone(
                               category.name, 
                               Math.min(100, Math.ceil(category.percentage / 25) * 25)
                             )
                           }`
                       }
                     </div>
                   </div>
                 )}
               </div>
             );
           })}
         </div>
       </div>
     </div>
   </div>
 );
};

export default Dashboard;