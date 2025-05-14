import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import { ProgressContext } from '../../context/ProgressContext';
import { courseModules, categories } from '../../constants/courseData';
import StudyTimer from '../UI/StudyTimer';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProgress, allUsersProgress, updateModuleStatus } = useContext(ProgressContext) || { 
    userProgress: [], 
    allUsersProgress: [],
    updateModuleStatus: () => console.log('updateModuleStatus not available')
  };
  
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
  
  // Generate milestone based on completion percentage
  const getMilestone = (completion) => {
    if (completion >= 100) return { title: "Full Stack Master! 🎓", description: "You've completed the entire bootcamp! Congratulations!" };
    if (completion >= 75) return { title: "Backend Developer! 💻", description: "You've mastered backend development concepts!" };
    if (completion >= 50) return { title: "JavaScript Ninja! ⚡", description: "You're getting great at JavaScript and DOM manipulation!" };
    if (completion >= 25) return { title: "HTML/CSS Wizard! 🧙‍♂️", description: "You've learned the fundamentals of web design!" };
    return { title: "Just Getting Started! 🌱", description: "Keep going! You're on the path to becoming a developer!" };
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
        
        {/* Category Progress Section */}
        <div style={styles.weeklyContainer}>
          <h3 style={styles.cardTitle}>Progress by Category</h3>
          <div style={styles.categoryGrid}>
            {categoryCompletion.map((category, index) => (
              <div key={index} style={styles.categoryCard}>
                <div style={styles.categoryHeader}>
                  <div style={styles.categoryTitle}>{category.name}</div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;