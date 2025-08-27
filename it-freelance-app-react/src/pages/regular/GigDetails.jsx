import React, { useState, useEffect, useMemo } from 'react';
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
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

  // Bidding (licitation) state
  const [bidOpen, setBidOpen] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [bid, setBid] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidsSummary, setBidsSummary] = useState({
    highestBid: null,     // number
    leaderName: null,     // string
    isLocked: false,      // boolean
    winnerName: null,     // string
    winnerPrice: null     // number
  });

  const token = useMemo(() => sessionStorage.getItem('token'), []);

  // Helpers to parse differently-shaped API payloads safely
  const parseSummary = (payload) => {
    if (!payload || typeof payload !== 'object') {
      return { highestBid: null, leaderName: null, isLocked: false, winnerName: null, winnerPrice: null };
    }

    // Highest bid amount
    const highestBid =
      payload.highest_bid ??
      payload.max_bid ??
      payload.max_price ??
      payload.highest ??
      payload.price ??
      payload.amount ??
      null;

    // Leader name (the current highest bidder)
    const leaderName =
      payload.leader_name ??
      payload.highest_bidder_name ??
      payload.buyer_name ??
      payload.bidder_name ??
      payload.leader?.name ??
      payload.highest_bidder?.name ??
      payload.buyer?.name ??
      null;

    // Locked / winner info
    const isLocked = !!(payload.is_locked ?? payload.locked);
    const winnerName =
      payload.winner_name ??
      payload.winner?.name ??
      null;
    const winnerPrice =
      payload.winner_price ??
      payload.winning_price ??
      null;

    return {
      highestBid: (highestBid != null ? Number(highestBid) : null),
      leaderName,
      isLocked,
      winnerName,
      winnerPrice: (winnerPrice != null ? Number(winnerPrice) : null)
    };
  };

  // Fetch gig
  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);

        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/gigs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch gig details');
        }
        
        const data = await response.json();
        setGig(data.data);
      } catch (err) {
        console.error('Error fetching gig details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGigDetails();
  }, [id, navigate, token]);

  // Try to fetch a bidding summary for this gig.
  // 1) /gigs/:id/bids-summary (preferred)
  // 2) /orders/highest?gig_id=:id (fallback A)
  // 3) /orders/highest/:id     (fallback B)
  const fetchBidsSummary = async () => {
    if (!token) return;

    const tryFetch = async (url) => {
      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    // Preferred
    let payload = await tryFetch(`http://127.0.0.1:8000/api/gigs/${id}/bids-summary`);

    // Fallback A
    if (!payload) {
      payload = await tryFetch(`http://127.0.0.1:8000/api/orders/highest?gig_id=${id}`);
    }

    // Fallback B
    if (!payload) {
      payload = await tryFetch(`http://127.0.0.1:8000/api/orders/highest/${id}`);
    }

    if (payload) {
      setBidsSummary(prev => ({ ...prev, ...parseSummary(payload) }));
    } else {
      // If nothing works, keep defaults (means "no bids yet")
      setBidsSummary(prev => ({ ...prev, highestBid: null, leaderName: null }));
    }
  };

  // Load summary on page enter
  useEffect(() => {
    fetchBidsSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleGoBack = () => navigate('/gigs');

  const openBidDialog = async () => {
    setBidError('');
    // Always refresh the summary right before opening (latest highest / leader)
    await fetchBidsSummary();

    const min = Math.max(
      Number(gig?.price || 0),
      bidsSummary.highestBid ? Number(bidsSummary.highestBid) : 0
    );
    const suggested = bidsSummary.highestBid ? (min + 1) : min;
    setBid(String(suggested || ''));
    setBidOpen(true);
  };

  const closeBidDialog = () => {
    setBidOpen(false);
    setBid('');
    setBidError('');
  };

  const placeBid = async () => {
    try {
      setPlacingBid(true);
      setBidError('');

      if (!token) {
        navigate('/auth');
        return;
      }

      const numericBid = Number(bid);
      const min = Math.max(
        Number(gig?.price || 0),
        bidsSummary.highestBid ? Number(bidsSummary.highestBid) : 0
      );

      if (!Number.isFinite(numericBid) || numericBid <= 0) {
        setBidError('Please enter a valid bid.');
        setPlacingBid(false);
        return;
      }
      if (numericBid < min) {
        setBidError(`Your bid must be at least $${min.toFixed(2)}.`);
        setPlacingBid(false);
        return;
      }

      const res = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          gig_id: gig.id,
          price: numericBid
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to place bid');
      }

      alert('Your bid has been placed!');
      closeBidDialog();
      await fetchBidsSummary(); // refresh highest
    } catch (err) {
      console.error('Bid error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setPlacingBid(false);
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

  const isLocked = bidsSummary.isLocked;
  const winnerText = isLocked && bidsSummary.winnerName
    ? `Winner: ${bidsSummary.winnerName} ($${Number(bidsSummary.winnerPrice || 0).toFixed(2)})`
    : null;

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

                  {/* GitHub + phone */}
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

                {bidsSummary.highestBid && !isLocked ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          marginTop: 6,
                          marginBottom: 8
                        }}>
                          {/* Reserve a small lane for the label so the price doesn't hug it */}
                          <span style={{
                            color: '#000',
                            fontSize: 14,
                            flex: '0 0 140px',   // <-- increase/decrease this to tune spacing (e.g. 120–160)
                            whiteSpace: 'nowrap'
                          }}>
                            Current Highest
                          </span>

                          <span style={{
                            color: '#000',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginLeft: 12       // <-- extra gap right after the label
                          }}>
                            <span>
                              ${Number(bidsSummary.highestBid).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>

                            {bidsSummary.leaderName && (
                              <>
                                <span style={{ opacity: 0.35, margin: '0 8px' }}>•</span>
                                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  {bidsSummary.leaderName}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                ) : (
                  !isLocked && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#000' }}>Current Highest</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                        No bids yet
                      </Typography>
                    </Box>
                  )
                )}
                
                {isLocked && (
                  <Box sx={{ p: 1.5, border: '1px dashed #000', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold' }}>
                      {winnerText || 'Bidding locked'}
                    </Typography>
                  </Box>
                )}
                
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
                  onClick={openBidDialog}
                  disabled={isLocked}
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
                  {isLocked ? 'Bidding Locked' : 'Order Now'}
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

      {/* Bid Dialog */}
      <Dialog open={bidOpen} onClose={closeBidDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Place Your Bid</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#000', mb: 1.5 }}>
            Base price: <strong>${Number(gig.price).toFixed(2)}</strong>
          </Typography>
          {bidsSummary.highestBid ? (
            <Typography variant="body2" sx={{ color: '#000', mb: 1 }}>
              Current highest bid: <strong>${Number(bidsSummary.highestBid).toFixed(2)}</strong>
              {bidsSummary.leaderName ? ` by ${bidsSummary.leaderName}` : ''}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#000', mb: 1.5 }}>
              No bids yet — be the first!
            </Typography>
          )}
          <TextField
            type="number"
            label="Your bid ($)"
            fullWidth
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            margin="dense"
            inputProps={{ min: 0, step: '0.01' }}
            error={!!bidError}
            helperText={bidError || 'Enter a value >= base / highest'}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={closeBidDialog}
            sx={{ 
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
            disabled={placingBid}
          >
            Cancel
          </Button>
          <Button
            onClick={placeBid}
            variant="contained"
            disabled={placingBid}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            {placingBid ? 'Placing...' : 'Place Bid'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GigDetails;
