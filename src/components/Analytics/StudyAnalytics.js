// Create a new file: src/components/Analytics/StudyAnalytics.js

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../components/Auth/AuthContext';
import { ProgressContext } from '../../context/ProgressContext';
import { courseModules, categories } from '../../constants/courseData';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

const StudyAnalytics = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProgress } = useContext(ProgressContext);
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [studyTimeData, setStudyTimeData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCompleted: 0,
    completionRate: 0,
    averageTimePerModule: 0,
    mostProductiveDay: '',
    strongestCategory: '',
    totalStudyHours: 0
  });
  
  // Process data when userProgress changes
  useEffect(() => {
    if (!userProgress || userProgress.length === 0) return;
    
    // Process data for weekly activity chart
    const processWeeklyData = () => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCounts = Array(7).fill(0);
      
      // Count completed modules by day of week
      userProgress.forEach(progress => {
        if (progress.status === 'completed' && progress.updatedAt) {
          const completedDate = new Date(progress.updatedAt);
          const dayOfWeek = completedDate.getDay(); // 0 = Sunday, 6 = Saturday
          dayCounts[dayOfWeek]++;
        }
      });
      
      // Create chart data
      const chartData = days.map((day, index) => ({
        day,
        completed: dayCounts[index]
      }));
      
      setWeeklyData(chartData);
      
      // Find most productive day
      const maxCompletions = Math.max(...dayCounts);
      const mostProductiveDay = days[dayCounts.indexOf(maxCompletions)];
      
      return mostProductiveDay;
    };
    
    // Process data for category chart
    const processCategoryData = () => {
      const categoryStats = categories.map(category => {
        const categoryModules = courseModules.filter(module => module.category === category.name);
        const completedInCategory = userProgress.filter(p => 
          categoryModules.some(m => m.id === p.moduleId) && 
          p.status === 'completed'
        ).length;
        
        const inProgressInCategory = userProgress.filter(p => 
          categoryModules.some(m => m.id === p.moduleId) && 
          p.status === 'in-progress'
        ).length;
        
        const total = categoryModules.length;
        const percentage = total > 0 ? Math.round((completedInCategory / total) * 100) : 0;
        
        return {
          name: category.name,
          color: category.color,
          completed: completedInCategory,
          inProgress: inProgressInCategory,
          notStarted: total - completedInCategory - inProgressInCategory,
          percentage
        };
      });
      
      setCategoryData(categoryStats);
      
      // Find strongest category
      const maxPercentage = Math.max(...categoryStats.map(cat => cat.percentage));
      const strongestCategory = categoryStats.find(cat => cat.percentage === maxPercentage);
      
      return strongestCategory ? strongestCategory.name : '';
    };
    
    // Process study time data (placeholder - would use actual study session data)
    const processStudyTimeData = () => {
      // This would ideally use real study session data from Firebase
      // For now, we'll create mock data for demonstration
      const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mockHours = [1.5, 2.0, 0.5, 1.0, 2.5, 3.0, 1.0];
      
      const timeData = mockDays.map((day, index) => ({
        day,
        hours: mockHours[index]
      }));
      
      setStudyTimeData(timeData);
      
      // Calculate total study hours
      const totalHours = mockHours.reduce((sum, hours) => sum + hours, 0);
      
      return totalHours;
    };
    
    // Calculate overall statistics
    const calculateStatistics = (mostProductiveDay, strongestCategory, totalStudyHours) => {
      const totalCompleted = userProgress.filter(p => p.status === 'completed').length;
      const completionRate = Math.round((totalCompleted / courseModules.length) * 100);
      const averageTimePerModule = totalCompleted > 0 ? 
        (totalStudyHours / totalCompleted).toFixed(1) : 0;
      
      setStatistics({
        totalCompleted,
        completionRate,
        averageTimePerModule,
        mostProductiveDay,
        strongestCategory,
        totalStudyHours
      });
    };
    
    // Run all data processing
    const mostProductiveDay = processWeeklyData();
    const strongestCategory = processCategoryData();
    const totalStudyHours = processStudyTimeData();
    
    calculateStatistics(mostProductiveDay, strongestCategory, totalStudyHours);
  }, [userProgress]);
  
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '25px'
    },
    statCard: {
      backgroundColor: 'rgba(60, 60, 60, 0.5)',
      borderRadius: '8px',
      padding: '15px',
      textAlign: 'center'
    },
    statValue: {
      color: '#4d9aff',
      fontSize: '1.8rem',
      fontWeight: '600',
      marginBottom: '5px'
    },
    statLabel: {
      color: '#b3b3b3',
      fontSize: '0.9rem'
    },
    sectionTitle: {
      color: '#ffffff',
      fontSize: '1.1rem',
      marginTop: '25px',
      marginBottom: '15px',
      fontWeight: '600'
    },
    chartContainer: {
      height: '300px',
      backgroundColor: 'rgba(50, 50, 50, 0.5)',
      borderRadius: '8px',
      padding: '20px 10px',
      marginBottom: '25px'
    },
    insightBox: {
      backgroundColor: 'rgba(77, 154, 255, 0.1)',
      padding: '15px',
      borderRadius: '8px',
      margin: '10px 0 20px',
      borderLeft: '4px solid #4d9aff'
    },
    insightText: {
      color: '#e0e0e0',
      fontSize: '0.95rem'
    },
    highlightText: {
      color: '#4d9aff',
      fontWeight: '600'
    }
  };
  
  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#323232',
          border: '1px solid #4d9aff',
          borderRadius: '6px',
          padding: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}>
          <p style={{ color: '#ffffff', margin: '0 0 5px', fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '0' }}>
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <h3 style={styles.title}>Learning Analytics</h3>
      </div>
      
      {/* Key Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{statistics.totalCompleted}</div>
          <div style={styles.statLabel}>Modules Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{statistics.completionRate}%</div>
          <div style={styles.statLabel}>Overall Completion</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{statistics.totalStudyHours}</div>
          <div style={styles.statLabel}>Total Study Hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{statistics.averageTimePerModule}</div>
          <div style={styles.statLabel}>Hours Per Module</div>
        </div>
      </div>
      
      {/* Weekly Activity Chart */}
      <h4 style={styles.sectionTitle}>Weekly Activity Pattern</h4>
      <div style={styles.insightBox}>
        <p style={styles.insightText}>
          Your most productive day is <span style={styles.highlightText}>{statistics.mostProductiveDay}</span>. 
          Consider scheduling important study sessions on this day to maximize your effectiveness.
        </p>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
            <XAxis dataKey="day" stroke="#b3b3b3" />
            <YAxis stroke="#b3b3b3" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="completed" 
              name="Modules Completed" 
              fill="#4d9aff" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category Progress Chart */}
      <h4 style={styles.sectionTitle}>Progress by Category</h4>
      <div style={styles.insightBox}>
        <p style={styles.insightText}>
          Your strongest area is <span style={styles.highlightText}>{statistics.strongestCategory}</span>. 
          Try balancing your learning by focusing more on categories with lower completion rates.
        </p>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
            <XAxis type="number" stroke="#b3b3b3" />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#b3b3b3" 
              tick={{ fill: '#b3b3b3' }} 
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="completed" 
              name="Completed" 
              stackId="a" 
              fill="#4dff9d" 
            />
            <Bar 
              dataKey="inProgress" 
              name="In Progress" 
              stackId="a" 
              fill="#ff9d4d" 
            />
            <Bar 
              dataKey="notStarted" 
              name="Not Started" 
              stackId="a" 
              fill="#6b7280" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Study Time Chart */}
      <h4 style={styles.sectionTitle}>Daily Study Hours (Last Week)</h4>
      <div style={styles.insightBox}>
        <p style={styles.insightText}>
          You've studied for <span style={styles.highlightText}>{statistics.totalStudyHours} hours</span> in the last week. 
          Consistent daily practice, even in short sessions, is key to mastering programming skills.
        </p>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={studyTimeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
            <XAxis dataKey="day" stroke="#b3b3b3" />
            <YAxis stroke="#b3b3b3" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="hours" 
              name="Study Hours" 
              stroke="#ff9d4d" 
              strokeWidth={2}
              dot={{ r: 5, fill: '#ff9d4d' }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#ff9d4d' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyAnalytics;