import React from 'react';
import { Box, Container, Typography, IconButton, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <GitHubIcon />,
      url: 'https://github.com',
      color: '#333',
      hoverColor: '#6e5494'
    },
    {
      icon: <LinkedInIcon />,
      url: 'https://linkedin.com',
      color: '#0077b5',
      hoverColor: '#00a0dc'
    },
    {
      icon: <InstagramIcon />,
      url: 'https://instagram.com',
      color: '#e4405f',
      hoverColor: '#f77737'
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            position: 'relative'
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                '& a': {
                  color: 'inherit',
                  textDecoration: 'none',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '1px',
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'currentColor',
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease-in-out',
                  },
                  '&:hover::after': {
                    transform: 'scaleX(1)',
                  },
                },
              }}
            >
              © {currentYear}{' '}
              <Link href="/" target="_blank">
                Cat.dev_
              </Link>
              . All rights reserved.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              '& .MuiIconButton-root': {
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                },
              },
            }}
          >
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: social.color,
                  '&:hover': {
                    color: social.hoverColor,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 