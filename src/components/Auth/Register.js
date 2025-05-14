import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, name);
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
      
      // Show more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email format.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to create an account: ${error.message}`);
      }
      
      setLoading(false);
    }
  };
  
  const styles = {
    container: {
      maxWidth: '450px',
      margin: '80px auto',
      padding: '30px',
      backgroundColor: '#2c2c2c',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid #3c3c3c',
      color: '#e0e0e0'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '25px',
      color: '#ffffff',
      textAlign: 'center'
    },
    error: {
      color: '#fc8181',
      backgroundColor: '#3c2a2a',
      padding: '12px 15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem',
      borderLeft: '3px solid #fc8181'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#b3b3b3',
      fontSize: '1rem'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      backgroundColor: '#333333',
      border: '1px solid #4c4c4c',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#e0e0e0',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#48bb78', // Green for register button
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '15px'
    },
    buttonHover: {
      backgroundColor: '#38a169',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
    },
    link: {
      display: 'block',
      marginTop: '25px',
      textAlign: 'center',
      color: '#b3b3b3',
      fontSize: '0.95rem'
    },
    linkAnchor: {
      color: '#4d9aff',
      textDecoration: 'none',
      fontWeight: '500'
    }
  };
  
  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={styles.container}>
        <h2 style={styles.title}>Register for BootcampTracker</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.target.style.border = '1px solid #4d9aff'}
              onBlur={(e) => e.target.style.border = '1px solid #4c4c4c'}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.target.style.border = '1px solid #4d9aff'}
              onBlur={(e) => e.target.style.border = '1px solid #4c4c4c'}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              style={styles.input}
              onFocus={(e) => e.target.style.border = '1px solid #4d9aff'}
              onBlur={(e) => e.target.style.border = '1px solid #4c4c4c'}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.target.style.border = '1px solid #4d9aff'}
              onBlur={(e) => e.target.style.border = '1px solid #4c4c4c'}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
              e.target.style.transform = styles.buttonHover.transform;
              e.target.style.boxShadow = styles.buttonHover.boxShadow;
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = styles.button.backgroundColor;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkAnchor}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;