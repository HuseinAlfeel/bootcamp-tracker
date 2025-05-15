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
    
    // Process study time data based on completed modules
    const processStudyTimeData = () => {
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
      
      setStudyTimeData(result);
      
      // Calculate total study hours
      const totalHours = result.reduce((sum, day) => sum + day.hours, 0);
      
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
  
  return null; // This component doesn't render anything on its own anymore
};

export default StudyAnalytics;