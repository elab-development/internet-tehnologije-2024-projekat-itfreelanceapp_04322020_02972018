import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../../animations/animation4.json';
import Slider from '../../components/Slider';

const SellerHome = () => {
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(200 - Math.random() * 100);
  const fullText = 'Welcome to cat.dev_';

  // Memoize animation options for better performance
  const animationOptions = useMemo(() => ({
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      clearCanvas: false,
      progressiveLoad: true,
      hideOnTransparent: true,
    },
    loop: true,
    autoplay: true,
  }), []);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => {
      clearInterval(ticker);
    };
  }, [text, delta]);

  const tick = () => {
    if (isDeleting) {
      setText(prev => prev.substring(0, prev.length - 1));
      setDelta(prevDelta => prevDelta / 2);
    } else {
      setText(prev => fullText.substring(0, prev.length + 1));
      setDelta(200 - Math.random() * 100);
    }

    if (!isDeleting && text === fullText) {
      setIsDeleting(true);
      setDelta(1000);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setDelta(500);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: '#fff',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Background Animation - with performance optimizations */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.05, // Reduced opacity for better performance
          transform: 'scale(1.2)', // Slightly reduced scale for better performance
          pointerEvents: 'none' // Prevent interaction with animation
        }}
      >
        <Player
          src={animationData}
          {...animationOptions}
          style={{ 
            width: '100%', 
            height: '100%',
            willChange: 'transform', // Performance hint for browser
          }}
        />
      </Box>

      {/* Content Container */}
      <Container sx={{ pt: 10, pb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          className="typewriter-title"
          sx={{
            color: '#000',
            mb: 2,
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '0.02em',
            textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            '&::after': {
              content: '""',
              display: 'inline-block',
              width: '0.1em',
              height: '1em',
              backgroundColor: '#000',
              marginLeft: '0.2em',
              animation: 'blink 1s step-end infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0 }
              }
            }
          }}
        >
          {text}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#000',
            fontWeight: 400,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            letterSpacing: '0.01em',
            opacity: 0.8
          }}
        >
          Manage your services and grow your business.
        </Typography>
      </Container>

      <Container 
        sx={{ 
          mt: 6, 
          mb: 8, 
          position: 'relative', 
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 4,
          p: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Slider />
      </Container>
    </Box>
  );
};

export default React.memo(SellerHome); 