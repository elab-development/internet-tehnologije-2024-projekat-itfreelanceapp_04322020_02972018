import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  Button,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Logout successful!');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Logout failed!');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout.');
    }
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    const role = user.role?.toLowerCase() || '';
    
    if (role === 'administrator') {
      return [
        { name: 'Home', path: '/administrator-home' },
        { name: 'App Metrics', path: '/app-metrics' }
      ];
    } else if (role === 'seller') {
      return [
        { name: 'Home', path: '/seller-home' },
        { name: 'Orders', path: '/seller-orders' },
        { name: 'My Gigs', path: '/my-gigs' }
      ];
    } else {
      // Default for buyer
      return [
        { name: 'Home', path: '/buyer-home' },
        { name: 'Gigs', path: '/gigs' },
        { name: 'Orders', path: '/orders' }
      ];
    }
  };

  if (!user) return null;

  const NavButton = ({ children, path }) => {
    const isActive = location.pathname === path;
    return (
      <Button
        onClick={() => navigate(path)}
        sx={{
          color: isActive ? '#000' : 'rgba(0,0,0,0.6)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: isActive ? '#000' : 'transparent',
            transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.3s ease-in-out',
          },
          '&:hover': {
            color: '#000',
            '&::after': {
              transform: 'scaleX(1)',
              backgroundColor: '#000',
            },
          },
          fontWeight: isActive ? 600 : 400,
          textTransform: 'none',
          px: 2,
          py: 1,
        }}
      >
        {children}
      </Button>
    );
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <img 
            src="/images/logo.png" 
            alt="Logo" 
            style={{ 
              height: '40px', 
              marginRight: '10px',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {getNavItems().map((item) => (
              <NavButton key={item.name} path={item.path}>
                {item.name}
              </NavButton>
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1,
              borderRadius: 2,
            }}
          >
            <Avatar 
              src={`https://picsum.photos/seed/${user.email}/200`}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#000',
                  fontWeight: 600,
                  lineHeight: 1,
                  mb: 0
                }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(0,0,0,0.6)',
                  textTransform: 'capitalize',
                  lineHeight: 1,
                  mt: 0
                }}
              >
                {user.role}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: theme.palette.error.main,
              borderColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: 'rgba(211,47,47,0.05)',
                borderColor: theme.palette.error.dark,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(211,47,47,0.2)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 