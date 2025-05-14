// Create a new file: src/components/Achievements/Achievements.js

import React, { useContext, useState, useEffect } from 'react';
import { ProgressContext } from '../../context/ProgressContext';

const Achievements = () => {
  const { userAchievements } = useContext(ProgressContext);
  const [showAll, setShowAll] = useState(false);
  
  // Achievement definitions
  const achievementDetails = {
    first_module: {
      id: 'first_module',
      title: 'First Steps',
      description: 'Completed your first module',
      icon: '🌱',
      color: '#4dff9d'
    },
    five_modules: {
      id: 'five_modules',
      title: 'Getting Traction',
      description: 'Completed 5 modules',
      icon: '🚀',
      color: '#4d9aff'
    },
    ten_modules: {
      id: 'ten_modules',
      title: 'Serious Learner',
      description: 'Completed 10 modules',
      icon: '📚',
      color: '#c44dff'
    },
    three_day_streak: {
      id: 'three_day_streak',
      title: 'Consistency Begins',
      description: 'Maintained a 3-day study streak',
      icon: '🔥',
      color: '#ff9d4d'
    },
    seven_day_streak: {
      id: 'seven_day_streak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day study streak',
      icon: '🏆',
      color: '#ffd700'
    },
    category_completed: {
      id: 'category_completed',
      title: 'Category Master',
      description: 'Completed all modules in a category',
      icon: '🎓',
      color: '#ff4d4d'
    }
  };
  
  // All possible achievements
  const allAchievements = Object.values(achievementDetails);
  
  // Get unlocked achievements
  const unlockedAchievements = allAchievements.filter(
    achievement => userAchievements.includes(achievement.id)
  );
  
  // Get locked achievements
  const lockedAchievements = allAchievements.filter(
    achievement => !userAchievements.includes(achievement.id)
  );
  
  // Styles
  const styles = {
    container: {
      backgroundColor: '#2c2c2c',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      border: '1px solid #3c3c3c',
      marginBottom: '30px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      color: '#ffffff',
      fontSize: '1.25rem',
      margin: 0
    },
    toggleButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4d9aff',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: '5px',
      fontSize: '0.9rem'
    },
    achievementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '15px'
    },
    achievementCard: (color, unlocked) => ({
      backgroundColor: unlocked ? 'rgba(60, 60, 60, 0.5)' : 'rgba(40, 40, 40, 0.5)',
      borderRadius: '8px',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      border: unlocked ? `2px solid ${color}` : '2px solid #3c3c3c',
      position: 'relative',
      overflow: 'hidden',
      filter: unlocked ? 'none' : 'grayscale(1) brightness(0.7)',
      transition: 'all 0.3s ease'
    }),
    achievementIcon: {
      fontSize: '2rem',
      margin: '10px 0',
      position: 'relative',
      zIndex: 2
    },
    achievementTitle: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.95rem',
      margin: '5px 0',
      position: 'relative',
      zIndex: 2
    },
    achievementDescription: {
      color: '#b3b3b3',
      fontSize: '0.8rem',
      position: 'relative',
      zIndex: 2
    },
    achievementGlow: (color) => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      zIndex: 1
    }),
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ffd700',
      color: '#000000',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.8rem',
      border: '2px solid #2c2c2c',
      zIndex: 3
    },
    progressText: {
      textAlign: 'center',
      color: '#b3b3b3',
      fontSize: '0.9rem',
      marginTop: '10px'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Achievements</h3>
        <button 
          style={styles.toggleButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Unlocked Only' : 'Show All Achievements'}
        </button>
      </div>
      
      <div style={styles.achievementsGrid}>
        {unlockedAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            style={styles.achievementCard(achievement.color, true)}
          >
            {achievement.id === 'seven_day_streak' && 
              <div style={styles.badge}>🌟</div>
            }
            <div style={styles.achievementGlow(achievement.color)} />
            <div style={styles.achievementIcon}>{achievement.icon}</div>
            <div style={styles.achievementTitle}>{achievement.title}</div>
            <div style={styles.achievementDescription}>{achievement.description}</div>
          </div>
        ))}
        
        {showAll && lockedAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            style={styles.achievementCard(achievement.color, false)}
          >
            <div style={styles.achievementIcon}>{achievement.icon}</div>
            <div style={styles.achievementTitle}>{achievement.title}</div>
            <div style={styles.achievementDescription}>{achievement.description}</div>
          </div>
        ))}
      </div>
      
      <div style={styles.progressText}>
        {unlockedAchievements.length} / {allAchievements.length} achievements unlocked
      </div>
    </div>
  );
};

export default Achievements;