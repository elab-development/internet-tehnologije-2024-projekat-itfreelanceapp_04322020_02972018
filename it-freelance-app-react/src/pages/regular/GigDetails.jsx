import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Divider, 
  Chip, 
  Button, 
  Paper, 
  Rating, 
  Skeleton,
  Avatar,
  Stack,
  IconButton,
  Link
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import GitHubIcon from '@mui/icons-material/GitHub';
import PhoneIcon from '@mui/icons-material/Phone';
import animationData from '../../animations/animation3.json';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  
  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          navigate('/auth');
          return;
        }
        
        const response = await fetch(`http://127.0.0.1:8000/api/gigs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch gig details');
        }
        
        const data = await response.json();
        setGig(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gig details:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchGigDetails();
  }, [id, navigate]);
  
  const handleGoBack = () => {
    navigate('/gigs');
  };
  
  const handleOrder = async () => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      setOrderSuccess(false);
      
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gig_id: gig.id,
          price: gig.price,
          delivery_time: gig.delivery_time
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      
      setOrderSuccess(true);
      alert(`Order placed successfully! Your order for "${gig.title}" has been created.`);
      
    } catch (err) {
      console.error('Error placing order:', err);
      setOrderError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
          <Skeleton variant="text" width="60%" height={80} />
          <Skeleton variant="text" width="90%" height={120} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, border: '2px solid #000', borderRadius: 2 }}>
          <Typography variant="h5" color="error">Error loading gig details: {error}</Typography>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            sx={{ 
              mt: 2,
              color: '#000',
              borderColor: '#000',
              '&:hover': {
                backgroundColor: '#000',
                color: '#fff',
              }
            }}
          >
            Go Back to Gigs
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!gig) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, border: '2px solid #000', borderRadius: 2 }}>
          <Typography variant="h5">Gig not found</Typography>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            sx={{ 
              mt: 2,
              color: '#000',
              borderColor: '#000',
              '&:hover': {
                backgroundColor: '#000',
                color: '#fff',
              }
            }}
          >
            Go Back to Gigs
          </Button>
        </Paper>
      </Container>
    );
  }

  // Normalize optional contact fields
  const rawGithub = gig?.user?.github_link || '';
  const githubUrl = rawGithub
    ? (rawGithub.startsWith('http://') || rawGithub.startsWith('https://') ? rawGithub : `https://${rawGithub}`)
    : null;
  const phone = gig?.user?.phone || '';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
        backgroundColor: '#fff'
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.1,
          transform: 'scale(1.5)'
        }}
      >
        <Player
          src={animationData}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ 
              color: '#000',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
              }
            }}
          >
            Back to Gigs
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          {/* Left Column - Gig Details */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0, 
                overflow: 'hidden', 
                border: '2px solid #000',
                borderRadius: 2,
                mb: 4
              }}
            >
              <Box 
                sx={{ 
                  height: 400, 
                  width: '100%', 
                  backgroundImage: `url(https://picsum.photos/seed/${gig.id}/800/400)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Paper>
            
            <Box sx={{ mb: 4 }}>
              <Chip 
                label={gig.category} 
                sx={{ 
                  bgcolor: '#000',
                  color: '#fff',
                  fontWeight: 'bold',
                  mb: 2
                }}
              />
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#000'
                }}
              >
                {gig.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Rating 
                  value={gig.rating || 0} 
                  precision={0.5} 
                  readOnly 
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#000',
                    },
                  }}
                />
                
                <Typography variant="body1" sx={{ color: '#000' }}>
                  {gig.rating ? (typeof gig.rating === 'number' ? gig.rating.toFixed(1) : Number(gig.rating).toFixed(1)) : 'No ratings yet'}
                </Typography>
              </Box>
            </Box>
            
            {/* Description Section */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#000',
                  borderBottom: '2px solid #000',
                  pb: 1
                }}
              >
                Description
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  color: '#000'
                }}
              >
                {gig.description}
              </Typography>
            </Box>
            
            {/* Feedback Section */}
            {gig.feedback && (
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: '#000',
                    borderBottom: '2px solid #000',
                    pb: 1
                  }}
                >
                  Client Feedback
                </Typography>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid #000',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormatQuoteIcon sx={{ fontSize: 40, color: '#000', transform: 'rotate(180deg)' }} />
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontStyle: 'italic',
                          color: '#000',
                          mb: 2
                        }}
                      >
                        {gig.feedback}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating 
                          value={gig.rating || 0} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: '#000',
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                          — Satisfied Customer
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
            
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#000',
                  borderBottom: '2px solid #000',
                  pb: 1
                }}
              >
                About the Seller
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '2px solid #000'
                  }}
                >
                  {gig.user.name.charAt(0)}
                </Avatar>
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                      {gig.user.name}
                    </Typography>
                    <VerifiedIcon sx={{ color: '#000' }} />
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#000' }}>
                    Professional {gig.category} Expert
                  </Typography>

                  {/* New: GitHub link + phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <IconButton
                      component={githubUrl ? 'a' : 'button'}
                      href={githubUrl || undefined}
                      target={githubUrl ? '_blank' : undefined}
                      rel={githubUrl ? 'noopener noreferrer' : undefined}
                      aria-label="GitHub profile"
                      disabled={!githubUrl}
                      sx={{ color: '#000' }}
                    >
                      <GitHubIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: '#000' }} />
                      {phone ? (
                        <Link
                          href={`tel:${phone}`}
                          underline="none"
                          sx={{ color: '#000', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                        >
                          {phone}
                        </Link>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#000', opacity: 0.7 }}>
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          {/* Right Column - Order Box */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                position: 'sticky',
                top: 100,
                border: '2px solid #000',
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                Order Details
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#000' }}>Base Price</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    ${gig.price}
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: '#000', borderWidth: '1px' }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#000' }} />
                  <Typography sx={{ color: '#000' }}>
                    <strong>{gig.delivery_time}</strong> days delivery
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleOrder}
                  disabled={orderLoading}
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#333',
                    }
                  }}
                >
                  {orderLoading ? 'Processing...' : 'Order Now'}
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#000' }}>
                    You won't be charged yet
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GigDetails;
