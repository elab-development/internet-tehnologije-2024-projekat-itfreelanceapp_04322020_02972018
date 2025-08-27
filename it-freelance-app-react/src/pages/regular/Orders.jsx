import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import animationData from '../../animations/animation3.json';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null); // store whole order so we have gig.id or gig_id
  const [ratingValue, setRatingValue] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');

        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data); // API returns { data: [...] }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    // Get user type from session storage
    const userInfo = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUserType(userInfo.user_type || null);
  }, []);

  const goBack = () => {
    navigate('/gigs');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Completed" 
            color="success" 
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              borderWidth: 2,
              '& .MuiChip-icon': { color: 'success.main' }
            }}
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Cancelled" 
            color="error" 
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              borderWidth: 2,
              '& .MuiChip-icon': { color: 'error.main' }
            }}
          />
        );
      default:
        return (
          <Chip 
            icon={<AccessTimeIcon />} 
            label="Pending" 
            color="warning" 
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              borderWidth: 2,
              '& .MuiChip-icon': { color: 'warning.main' }
            }}
          />
        );
    }
  };

  // ----- Review modal handlers -----
  const openReview = (order) => {
    setActiveOrder(order);
    setRatingValue(order?.gig?.rating ? Number(order.gig.rating) : 0); // prefill if you already include it
    setFeedback(order?.gig?.feedback || '');
    setReviewOpen(true);
  };

  const closeReview = () => {
    setReviewOpen(false);
    setActiveOrder(null);
    setRatingValue(0);
    setFeedback('');
  };

  const submitReview = async () => {
    try {
      setSubmittingReview(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Use the route mapped to GigController@updateRatingFeedback
      // PATCH /api/gigs/{id}/rating
      const gigId = activeOrder?.gig?.id ?? activeOrder?.gig_id;
      if (!gigId) {
        alert('Error: gig id is missing for this order.');
        setSubmittingReview(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/gigs/${gigId}/rating`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating: ratingValue,
          feedback: feedback
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      alert('Thank you! Your review has been submitted.');

      // Optional: reflect new rating/feedback in current table row
      setOrders(prev =>
        prev.map(o =>
          o.id === activeOrder.id
            ? { ...o, gig: { ...(o.gig || {}), id: gigId, rating: ratingValue, feedback } }
            : o
        )
      );

      closeReview();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };
  // ---------------------------------

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000' }}>
            <Skeleton width={200} />
          </Typography>
        </Box>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Skeleton key={index} variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading orders: {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={goBack}
          sx={{ 
            color: '#000',
            borderColor: '#000',
            '&:hover': {
              backgroundColor: '#000',
              color: '#fff',
            }
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

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
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            mb: 4,
            color: '#000',
            borderBottom: '2px solid #000',
            pb: 2
          }}
        >
          {userType === 'seller' ? 'Orders for My Gigs' : 'My Orders'}
        </Typography>

        {orders.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              border: '2px solid #000',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ color: '#000' }}>
              You haven't received any orders yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              border: '2px solid #000',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#000' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Gig</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Seller</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  {/* New Actions column header */}
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.07)' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>#{order.id}</TableCell>
                    <TableCell sx={{ color: '#000' }}>{order.gig.title}</TableCell>
                    <TableCell sx={{ color: '#000' }}>{order.seller.name}</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>${order.gig.price}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>

                    {/* New Actions cell: Leave a Review only for completed */}
                    <TableCell sx={{ color: '#000' }}>
                      {order.status === 'completed' ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openReview(order)}
                          sx={{
                            borderWidth: 2,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { borderWidth: 2 }
                          }}
                        >
                          Leave a Review
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={closeReview} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Leave a Review</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: '#000' }}>
            Rating
          </Typography>
          <Rating
            name="order-rating"
            value={ratingValue}
            onChange={(_, newValue) => setRatingValue(newValue || 0)}
            precision={0.5}
            sx={{
              mb: 2,
              '& .MuiRating-iconFilled': { color: '#000' }
            }}
          />
          <TextField
            label="Feedback"
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with this order..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={closeReview}
            sx={{ 
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
            disabled={submittingReview}
          >
            Cancel
          </Button>
          <Button
            onClick={submitReview}
            variant="contained"
            disabled={submittingReview || ratingValue === 0 || !activeOrder}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
