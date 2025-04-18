import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import { useNavigate } from 'react-router-dom';
import animationData from '../../animations/animation1.json';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userDataStr = sessionStorage.getItem('user');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.role) {
          setIsLoading(false);
          setIsRedirecting(true);
          switch (userData.role) {
            case 'buyer':
              navigate('/buyer-home', { replace: true });
              break;
            case 'seller':
              navigate('/seller-home', { replace: true });
              break;
            case 'administrator':
              navigate('/administrator-home', { replace: true });
              break;
            default:
              navigate('/buyer-home', { replace: true });
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  // Hide footer and navigation
  useEffect(() => {
    const footer = document.querySelector('footer');
    const nav = document.querySelector('nav');
    if (footer) footer.style.display = 'none';
    if (nav) nav.style.display = 'none';

    return () => {
      if (footer) footer.style.display = 'block';
      if (nav) nav.style.display = 'block';
    };
  }, []);

  // 0 = Login, 1 = Register
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'buyer',
    github_link: '',
    phone: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Login failed!');
        return;
      }

      // Check if data has the expected structure
      if (!data.id || !data.role) {
        console.error('Invalid response structure:', data);
        alert('Invalid server response. Please try again.');
        return;
      }

      // Store token and user data
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      // Show success message
      alert(data.message || 'Login successful!');
      setIsRedirecting(true);
      
      // Navigate based on user type
      switch (data.role) {
        case 'buyer':
          navigate('/buyer-home', { replace: true });
          break;
        case 'seller':
          navigate('/seller-home', { replace: true });
          break;
        case 'administrator':
          navigate('/admin-home', { replace: true });
          break;
        default:
          navigate('/buyer-home', { replace: true });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Registration failed!');
        return;
      }

      // Show success message
      alert(data.message || 'Registration successful! Please login.');
      
      // Switch to login tab and pre-fill email
      setTabValue(0);
      setLoginData(prev => ({ ...prev, email: registerData.email }));
      
      // Reset register form
      setRegisterData({
        name: '',
        email: '',
        password: '',
        user_type: 'buyer',
        github_link: '',
        phone: '',
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    }
  };

  if (isLoading || isRedirecting) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: '#fff', 
        minHeight: '100vh', 
        position: 'relative',
        overflow: 'hidden',
        pt: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Top Left Animation */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '300px',
          zIndex: 0,
        }}
      >
        <Player
          src={animationData}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {/* Top Right Animation (Inverted) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          zIndex: 0,
          transform: 'scaleX(-1)'
        }}
      >
        <Player
          src={animationData}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {/* Bottom Left Animation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '300px',
          height: '300px',
          zIndex: 0,
          transform: 'scaleY(-1)'
        }}
      >
        <Player
          src={animationData}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {/* Bottom Right Animation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '300px',
          height: '300px',
          zIndex: 0,
          transform: 'scale(-1)'
        }}
      >
        <Player
          src={animationData}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #000',
            color: '#000',
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            marginTop: '50px',
            marginBottom: '50px'
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img src="/images/logo.png" alt="Logo" style={{ height: '50px' }} />
          </Box>

          {/* Tabs for toggling */}
          <Tabs value={tabValue} onChange={handleTabChange} centered textColor="inherit" indicatorColor="primary" sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {tabValue === 0 ? (
            <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" align="center">
                Login
              </Typography>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <Button type="submit" variant="contained" sx={{ backgroundColor: '#000', color: '#fff' }}>
                Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" align="center">
                Register
              </Typography>
              <TextField
                label="Full Name"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel id="user-type-label" sx={{ color: '#000' }}>
                  User Type
                </InputLabel>
                <Select
                  labelId="user-type-label"
                  label="User Type"
                  name="user_type"
                  value={registerData.user_type}
                  onChange={handleRegisterChange}
                  sx={{ color: '#000' }}
                >
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="administrator">Administrator</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="GitHub Link (optional)"
                name="github_link"
                value={registerData.github_link}
                onChange={handleRegisterChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <TextField
                label="Phone (optional)"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#000' } }}
              />
              <Button type="submit" variant="contained" sx={{ backgroundColor: '#000', color: '#fff' }}>
                Register
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Auth;
