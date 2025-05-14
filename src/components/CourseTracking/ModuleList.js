import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import { ProgressContext } from '../../context/ProgressContext';
import { courseModules, categories } from '../../constants/courseData';

const ModuleList = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProgress, updateModuleStatus } = useContext(ProgressContext) || {
    userProgress: [],
    updateModuleStatus: () => console.log('updateModuleStatus not available')
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get module status
  const getModuleStatus = (moduleId) => {
    const moduleProgress = userProgress.find(p => p.moduleId === moduleId);
    return moduleProgress ? moduleProgress.status : 'not-started';
  };

  // Filter modules based on category and status
  const getFilteredModules = () => {
    return courseModules.filter(module => {
      const moduleStatus = getModuleStatus(module.id);
      const categoryMatch = selectedCategory === 'all' || module.category === selectedCategory;
      const statusMatch = selectedStatus === 'all' || moduleStatus === selectedStatus;
      return categoryMatch && statusMatch;
    });
  };

  // Get category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6b7280';
  };

  // Handle module status change
  const handleStatusChange = (moduleId, newStatus) => {
    updateModuleStatus(moduleId, newStatus);
  };

  const filteredModules = getFilteredModules();

  // Styles
  const styles = {
container: {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#1e1e1e', // Ensure this is dark
  minHeight: 'calc(100vh - 70px)',
  color: '#e0e0e0',
  borderRadius: '0px'
},
    header: {
      fontSize: '2rem',
      marginBottom: '30px',
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '700'
    },
    filtersContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginBottom: '20px',
      backgroundColor: '#2c2c2c',
      padding: '15px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
      border: '1px solid #3c3c3c'
    },
    filterGroup: {
      marginBottom: '10px'
    },
    filterLabel: {
      marginBottom: '8px',
      color: '#b3b3b3',
      fontSize: '0.9rem'
    },
    filterButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    filterButton: (isSelected, color) => ({
      padding: '8px 12px',
      backgroundColor: isSelected ? color || '#4d9aff' : '#323232',
      color: isSelected ? '#ffffff' : '#b3b3b3',
      border: `1px solid ${isSelected ? color || '#4d9aff' : '#4f4f4f'}`,
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
    }),
    modulesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    moduleCard: (categoryColor) => ({
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
      borderLeft: `4px solid ${categoryColor}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      border: '1px solid #3c3c3c'
    }),
    moduleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    moduleTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '5px'
    },
    moduleCategory: (color) => ({
      fontSize: '0.8rem',
      color: color,
      marginBottom: '10px'
    }),
    moduleDescription: {
      fontSize: '0.95rem',
      color: '#b3b3b3',
      marginBottom: '20px'
    },
    statusButtons: {
      display: 'flex',
      gap: '10px'
    },
    statusButton: (isActive, color) => ({
      padding: '8px 12px',
      backgroundColor: isActive ? color : '#323232',
      color: isActive ? '#ffffff' : '#b3b3b3',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
      fontWeight: isActive ? '500' : '400',
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
    }),
    emptyMessage: {
      textAlign: 'center',
      padding: '40px',
      backgroundColor: '#2c2c2c',
      borderRadius: '10px',
      color: '#b3b3b3',
      fontSize: '1.1rem',
      border: '1px solid #3c3c3c',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Course Modules</h1>
      
      {/* Filters */}
      <div style={styles.filtersContainer}>
        {/* Category Filter */}
        <div style={styles.filterGroup}>
          <div style={styles.filterLabel}>Filter by Category</div>
          <div style={styles.filterButtons}>
            <button 
              style={styles.filterButton(selectedCategory === 'all', '#4d9aff')}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button 
                key={category.name}
                style={styles.filterButton(
                  selectedCategory === category.name,
                  category.color
                )}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Status Filter */}
        <div style={styles.filterGroup}>
          <div style={styles.filterLabel}>Filter by Status</div>
          <div style={styles.filterButtons}>
            <button 
              style={styles.filterButton(selectedStatus === 'all', '#4d9aff')}
              onClick={() => setSelectedStatus('all')}
            >
              All Statuses
            </button>
            <button 
              style={styles.filterButton(selectedStatus === 'not-started', '#6b7280')}
              onClick={() => setSelectedStatus('not-started')}
            >
              Not Started
            </button>
            <button 
              style={styles.filterButton(selectedStatus === 'in-progress', '#ff9d4d')}
              onClick={() => setSelectedStatus('in-progress')}
            >
              In Progress
            </button>
            <button 
              style={styles.filterButton(selectedStatus === 'completed', '#4dff9d')}
              onClick={() => setSelectedStatus('completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
      
      {/* Modules List */}
      <div style={styles.modulesList}>
        {filteredModules.length > 0 ? (
          filteredModules.map(module => {
            const status = getModuleStatus(module.id);
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
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                }}
              >
                <div style={styles.moduleHeader}>
                  <div>
                    <div style={styles.moduleTitle}>{module.id}. {module.title}</div>
                    <div style={styles.moduleCategory(categoryColor)}>{module.category}</div>
                  </div>
                </div>
                <div style={styles.moduleDescription}>{module.description}</div>
                <div style={styles.statusButtons}>
                  <button 
                    style={styles.statusButton(status === 'not-started', '#6b7280')}
                    onClick={() => handleStatusChange(module.id, 'not-started')}
                  >
                    Not Started
                  </button>
                  <button 
                    style={styles.statusButton(status === 'in-progress', '#ff9d4d')}
                    onClick={() => handleStatusChange(module.id, 'in-progress')}
                  >
                    In Progress
                  </button>
                  <button 
                    style={styles.statusButton(status === 'completed', '#4dff9d')}
                    onClick={() => handleStatusChange(module.id, 'completed')}
                  >
                    Completed
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyMessage}>
            No modules match your current filters. Try adjusting your filters to see more modules.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleList;