import React from 'react';
import { Box, Breadcrumbs as MUIBreadcrumbs, Typography, Link } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // location.pathname --> "/gigs"
  // nakon .split('/') --> ["", "gigs"] 
  //###############################################
  // Boolean kategorizacija u JS-u:
  // 1) Falsy --> "", false, 0, null i undefined
  // 2) Truthy --> sve sto nije falsy
  //###############################################
  // .filter radi sledece --> ako je x tj. element iz niza na kom smo truthy value zadrzi ga
  // a ako nije izbaci ga iz niza
  // dakle od ["", "gigs"] --> ["gigs"]
  //###############################################
  // drugi primer --> "http://localhost:3000/gigs/15"
  // location.pathname --> "/gigs/15"
  //.split("/") --> ["", "gigs", "15"]
  //.filter(x => x) --> ["gigs", "15"]
  const pathnames = location.pathname.split('/').filter(x => x);

  // Mapping for prettier path segments
  const pathMapping = {
    'gigs': 'Gigs',
    'my-gigs': 'My Gigs',
    'orders': 'Orders',
    'seller-orders': 'Seller Orders',
    'app-metrics': 'Analytics',
    'buyer-home': 'Home',
    'seller-home': 'Home',
    'administrator-home': 'Home',
    'auth': 'Login',
  };

  // Get user type from session storage
  const getUserType = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    return user.role || '';
  };
  
  const userType = getUserType();
  
  // Define home routes by user type to hide breadcrumbs on home pages
  const homeRoutes = {
    'buyer': '/buyer-home',
    'seller': '/seller-home',
    'administrator': '/administrator-home',
  };
  
  // Check if current path is a home route
  const isHomePage = homeRoutes[userType.toLowerCase()] === location.pathname;
  
  // Don't display breadcrumbs on home pages
  if (isHomePage) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        py: 1,
        px: 3,
        backdropFilter: 'blur(8px)',
        position: 'relative',
        zIndex: 2,
        mt: 8 // To position below the app bar
      }}
    >
      <MUIBreadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          }
        }}
      >
        <Link
          underline="hover"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#000',
            fontWeight: 500,
            '&:hover': {
              color: '#666'
            }
          }}
          color="inherit"
          onClick={() => {
            // Navigate to appropriate home based on user type
            if (userType.toLowerCase() === 'buyer') {
              navigate('/buyer-home');
            } else if (userType.toLowerCase() === 'seller') {
              navigate('/seller-home');
            } else if (userType.toLowerCase() === 'administrator') {
              navigate('/administrator-home');
            } else {
              navigate('/');
            }
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        
        {/*
        
        ["gigs", "15"] uzimamo ovaj niz za pathnames
           0,     1    indeksi
        pathnames.length = 2 --> 2-1 = 1   

        to nakon slice --> "/gigs/"

        
        
        */}
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Check if this is a dynamic segment (like an ID)
          const isDynamicSegment = !isNaN(value);
          
          // Special case for path segments that are IDs
          if (isDynamicSegment && pathnames[index - 1] === 'gigs') {
            return (
              <Typography 
                key={to} 
                color="text.primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: last ? 600 : 400,
                }}
              >
                Gig Details
              </Typography>
            );
          }
          
          return last ? (
            <Typography 
              key={to} 
              color="text.primary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
              }}
            >
              {pathMapping[value] || value.charAt(0).toUpperCase() + value.slice(1)}
            </Typography>
          ) : (
            <Link
              underline="hover"
              key={to}
              color="inherit"
              onClick={() => navigate(to)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#000',
                fontWeight: 500,
                '&:hover': {
                  color: '#666'
                }
              }}
            >
              {pathMapping[value] || value.charAt(0).toUpperCase() + value.slice(1)}
            </Link>
          );
        })}
      </MUIBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs; 