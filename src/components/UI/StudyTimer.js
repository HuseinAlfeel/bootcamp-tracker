// Create a new file: src/components/UI/StudyTimer.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../components/Auth/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const StudyTimer = () => {
  const { currentUser } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [seconds, setSeconds] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timerHistory, setTimerHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  // Fetch user study history
  useEffect(() => {
    const fetchStudyHistory = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.studySessions) {
            setTimerHistory(userData.studySessions);
          }
          
          if (userData.totalStudyTime) {
            setTotalFocusTime(userData.totalStudyTime);
          }
        }
      } catch (error) {
        console.error("Error fetching study history:", error);
      }
    };
    
    fetchStudyHistory();
  }, [currentUser]);
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          if (seconds === 0) {
            // Handle timer completion
            if ((mode === 'focus' && focusMinutes === 0) || 
                (mode === 'break' && breakMinutes === 0)) {
              clearInterval(interval);
              const newMode = mode === 'focus' ? 'break' : 'focus';
              setMode(newMode);
              
              if (newMode === 'focus') {
                setFocusMinutes(25);
                setBreakMinutes(5);
              } else {
                setFocusMinutes(0);
                setBreakMinutes(5);
              }
              
              // Log completed session to Firebase
              if (mode === 'focus') {
                logStudySession(25);
                // Play completion sound
                try {
                  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
                  audio.play();
                } catch (error) {
                  console.error("Error playing sound:", error);
                }
              }
              
              return 0;
            }
            
            // Decrement minutes
            if (mode === 'focus') {
              setFocusMinutes(minutes => minutes - 1);
            } else {
              setBreakMinutes(minutes => minutes - 1);
            }
            
            return 59;
          }
          return seconds - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, seconds, focusMinutes, breakMinutes, mode, currentUser]);
  
  const logStudySession = async (minutes) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentStudyTime = userData.totalStudyTime || 0;
        const studySessions = userData.studySessions || [];
        
        const newSession = {
          date: new Date().toISOString(),
          duration: minutes,
          mode: 'focus'
        };
        
        await updateDoc(userRef, {
          totalStudyTime: currentStudyTime + minutes,
          studySessions: [...studySessions, newSession]
        });
        
        // Update local state
        setTotalFocusTime(currentStudyTime + minutes);
        setTimerHistory([...studySessions, newSession]);
      }
    } catch (error) {
      console.error("Error logging study session:", error);
    }
  };
  
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setMode('focus');
    setSeconds(0);
    setFocusMinutes(25);
    setBreakMinutes(5);
  };
  
  // Format time as MM:SS
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Format date for history
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  // UI styles
  const styles = {
    timerContainer: {
      backgroundColor: mode === 'focus' ? '#213547' : '#183525',
      borderRadius: '10px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
      border: `1px solid ${mode === 'focus' ? '#4d9aff' : '#4dff9d'}`,
      transition: 'all 0.3s ease'
    },
    timerTitle: {
      color: '#ffffff',
      fontSize: '1.25rem',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    timerIcon: {
      fontSize: '1.5rem'
    },
    timerDisplay: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: mode === 'focus' ? '#4d9aff' : '#4dff9d',
      margin: '15px 0'
    },
    modeText: {
      color: '#b3b3b3',
      marginBottom: '20px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '15px'
    },
    button: (color) => ({
      backgroundColor: color,
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    }),
    infoContainer: {
      marginTop: '15px',
      padding: '10px',
      backgroundColor: 'rgba(77, 154, 255, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(77, 154, 255, 0.2)'
    },
    statText: {
      color: '#b3b3b3',
      fontSize: '0.9rem',
      margin: '5px 0'
    },
    statValue: {
      color: '#4d9aff',
      fontWeight: '600'
    },
    historyButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4d9aff',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: '5px',
      fontSize: '0.9rem'
    },
    historyContainer: {
      marginTop: '15px',
      maxHeight: '150px',
      overflowY: 'auto',
      backgroundColor: 'rgba(77, 154, 255, 0.05)',
      borderRadius: '8px',
      padding: '10px',
      border: '1px solid rgba(77, 154, 255, 0.1)'
    },
    historyItem: {
      padding: '8px',
      borderBottom: '1px solid rgba(77, 154, 255, 0.1)',
      fontSize: '0.9rem',
      color: '#b3b3b3',
      display: 'flex',
      justifyContent: 'space-between'
    }
  };

  // Calculate total hours
  const totalHours = Math.floor(totalFocusTime / 60);
  const remainingMinutes = totalFocusTime % 60;
  
  return (
    <div style={styles.timerContainer}>
      <h3 style={styles.timerTitle}>
        <span style={styles.timerIcon}>⏱️</span>
        Study Timer
      </h3>
      
      <div style={styles.timerDisplay}>
        {mode === 'focus' 
          ? formatTime(focusMinutes, seconds) 
          : formatTime(breakMinutes, seconds)
        }
      </div>
      
      <div style={styles.modeText}>
        {mode === 'focus' ? 'Focus Time' : 'Break Time'}
      </div>
      
      <div style={styles.buttonContainer}>
        {!isActive && !isPaused ? (
          <button 
            onClick={handleStart} 
            style={styles.button('#4d9aff')}
          >
            Start
          </button>
        ) : isPaused ? (
          <button 
            onClick={handleResume} 
            style={styles.button('#4dff9d')}
          >
            Resume
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            style={styles.button('#ff9d4d')}
          >
            Pause
          </button>
        )}
        <button 
          onClick={handleReset} 
          style={styles.button('#6b7280')}
        >
          Reset
        </button>
      </div>
      
      <div style={styles.infoContainer}>
        <div style={styles.statText}>
          Total focus time: <span style={styles.statValue}>
            {totalHours > 0 ? `${totalHours} hr ${remainingMinutes} min` : `${totalFocusTime} min`}
          </span>
        </div>
        <div style={styles.statText}>
          Completed sessions: <span style={styles.statValue}>{timerHistory.length}</span>
        </div>
        
        <button 
          style={styles.historyButton}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        
        {showHistory && timerHistory.length > 0 && (
          <div style={styles.historyContainer}>
            {timerHistory.slice().reverse().slice(0, 5).map((session, index) => (
              <div key={index} style={styles.historyItem}>
                <span>{formatDate(session.date)}</span>
                <span>{session.duration} minutes</span>
              </div>
            ))}
            {timerHistory.length > 5 && (
              <div style={{textAlign: 'center', padding: '5px', color: '#4d9aff', fontSize: '0.9rem'}}>
                + {timerHistory.length - 5} more sessions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;