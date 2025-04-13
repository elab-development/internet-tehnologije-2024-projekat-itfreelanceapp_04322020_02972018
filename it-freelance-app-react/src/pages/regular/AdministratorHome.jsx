import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../../animations/animation5.json';
import Slider from '../../components/Slider';

const AdministratorHome = () => {
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(200 - Math.random() * 100);
  const fullText = 'Welcome Administrator!';
  const [isComplete, setIsComplete] = useState(false);

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
  }, [text, isDeleting, delta, isComplete]);

  const tick = () => {
    // Current text is full
    if (!isDeleting && text === fullText) {
      setIsComplete(true);
      setIsDeleting(true);
      setDelta(2000); // Pause at the end before deleting
      return;
    }

    // Finished deleting
    if (isDeleting && text === '') {
      setIsDeleting(false);
      setIsComplete(false);
      setDelta(500); // Pause before typing again
      return;
    }

    // Typing out
    if (!isDeleting) {
      setText(prev => fullText.substring(0, prev.length + 1));
      setDelta(150); // Typing speed
    } 
    // Deleting
    else {
      setText(prev => prev.substring(0, prev.length - 1));
      setDelta(50); // Faster when deleting
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
          opacity: 0.05,
          transform: 'scale(1.2)',
          pointerEvents: 'none'
        }}
      >
        <Player
          src={animationData}
          {...animationOptions}
          style={{ 
            width: '100%', 
            height: '100%',
            willChange: 'transform',
          }}
        />
      </Box>

      {/* Content Container */}
      <Container sx={{ pt: 10, pb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{
            display: 'inline-block',
            color: '#000',
            mb: 2,
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '0.02em',
            textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: '-10px',
              top: '15%',
              height: '70%',
              width: '4px',
              backgroundColor: '#000',
              opacity: isComplete ? 1 : 0,
              animation: 'blink-caret 0.8s step-end infinite',
              '@keyframes blink-caret': {
                'from, to': { opacity: 0 },
                '50%': { opacity: 1 }
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
          Manage and monitor your freelance platform.
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

export default AdministratorHome; 