// Create a new file: src/components/Recommendations/StudyRecommendations.js

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../components/Auth/AuthContext';
import { ProgressContext } from '../../context/ProgressContext';
import { courseModules, categories } from '../../constants/courseData';

const StudyRecommendations = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProgress, updateModuleStatus } = useContext(ProgressContext) || {
    userProgress: [],
    updateModuleStatus: () => console.log('updateModuleStatus not available')
  };
  
  const [recommendations, setRecommendations] = useState({
    modules: [],
    tip: ''
  });
  
  // Learning tips
  const learningTips = [
    "Try using the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.",
    "Studies show that teaching concepts to others solidifies your own understanding.",
    "Create small coding projects to practice what you learn in each module.",
    "Take notes while learning to improve retention and create a personal reference.",
    "Schedule regular review sessions for previously completed modules.",
    "Try the 'rubber duck debugging' technique: explain your code to an object to find issues.",
    "Pair coding can improve problem-solving skills and expose you to new approaches.",
    "Set specific and achievable learning goals for each study session.",
    "Visualize concepts with diagrams and flowcharts to better understand relationships.",
    "Practice active recall by testing yourself rather than simply reviewing material."
  ];
  
  // Generate recommendations
  useEffect(() => {
    if (!userProgress || !currentUser) return;
    
    // Generate category completion data
    const categoryCompletion = categories.map(category => {
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
    
    // Identify areas where user has made least progress
    const weakestCategories = categoryCompletion
      .filter(cat => cat.percentage < 50)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 2);
    
    // If all categories are above 50%, recommend the one with lowest percentage
    const categoriesToFocus = weakestCategories.length > 0 ? 
      weakestCategories : 
      categoryCompletion.sort((a, b) => a.percentage - b.percentage).slice(0, 1);
    
    // Find not-started modules in these categories
    let recommendedModules = courseModules.filter(module => {
      const moduleStatus = userProgress.find(p => p.moduleId === module.id)?.status || 'not-started';
      return (
        moduleStatus === 'not-started' && 
        categoriesToFocus.some(cat => cat.name === module.category)
      );
    }).slice(0, 3);
    
    // If no not-started modules, recommend in-progress ones
    if (recommendedModules.length === 0) {
      recommendedModules = courseModules.filter(module => {
        const moduleProgress = userProgress.find(p => p.moduleId === module.id);
        return moduleProgress && moduleProgress.status === 'in-progress';
      }).slice(0, 3);
    }
    
    // If still no recommendations, recommend next modules in sequence
    if (recommendedModules.length === 0) {
      const completedModuleIds = userProgress
        .filter(p => p.status === 'completed')
        .map(p => p.moduleId);
      
      // Find the next uncompleted modules
      recommendedModules = courseModules
        .filter(module => !completedModuleIds.includes(module.id))
        .slice(0, 3);
    }
    
    // Generate random learning tip
    const randomTip = learningTips[Math.floor(Math.random() * learningTips.length)];
    
    setRecommendations({
      modules: recommendedModules,
      tip: randomTip
    });
  }, [userProgress, currentUser]);
  
  // Handle starting a module
  const handleStartModule = (moduleId) => {
    updateModuleStatus(moduleId, 'in-progress');
  };
  
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
      alignItems: 'center',
      marginBottom: '20px'
    },
    icon: {
      fontSize: '1.5rem',
      marginRight: '10px',
      color: '#4d9aff'
    },
    title: {
      color: '#ffffff',
      fontSize: '1.25rem',
      margin: 0
    },
       tipBox: {
      backgroundColor: 'rgba(77, 154, 255, 0.1)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      borderLeft: '4px solid #4d9aff'
    },
    tipIcon: {
      marginRight: '10px',
      color: '#4d9aff'
    },
    tipText: {
      color: '#e0e0e0',
      fontSize: '0.95rem',
      fontStyle: 'italic'
    },
    modulesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '15px'
    },
    moduleCard: (color) => ({
      backgroundColor: 'rgba(60, 60, 60, 0.5)',
      borderRadius: '8px',
      padding: '15px',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    }),
    moduleTitle: {
      color: '#ffffff',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '5px'
    },
    moduleCategory: (color) => ({
      color,
      fontSize: '0.85rem',
      marginBottom: '10px'
    }),
    moduleDescription: {
      color: '#b3b3b3',
      fontSize: '0.9rem',
      marginBottom: '15px'
    },
    startButton: {
      backgroundColor: '#4d9aff',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500',
      width: '100%'
    },
    emptyText: {
      color: '#b3b3b3',
      fontSize: '0.95rem',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: 'rgba(60, 60, 60, 0.5)',
      borderRadius: '8px'
    }
  };
  
  // Find category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6b7280';
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>💡</span>
        <h3 style={styles.title}>Personalized Recommendations</h3>
      </div>
      
      {/* Learning Tip */}
      <div style={styles.tipBox}>
        <p style={styles.tipText}>
          <span style={styles.tipIcon}>💭</span>
          {recommendations.tip}
        </p>
      </div>
      
      {/* Recommended Modules */}
      {recommendations.modules.length > 0 ? (
        <div style={styles.modulesGrid}>
          {recommendations.modules.map((module) => {
            const categoryColor = getCategoryColor(module.category);
            
            return (
              <div 
                key={module.id} 
                style={styles.moduleCard(categoryColor)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.moduleTitle}>
                  {module.id}. {module.title}
                </div>
                <div style={styles.moduleCategory(categoryColor)}>
                  {module.category}
                </div>
                <div style={styles.moduleDescription}>
                  {module.description}
                </div>
                <button 
                  style={styles.startButton}
                  onClick={() => handleStartModule(module.id)}
                >
                  Start Learning
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyText}>
          Generating recommendations based on your progress...
        </div>
      )}
    </div>
  );
};

export default StudyRecommendations;