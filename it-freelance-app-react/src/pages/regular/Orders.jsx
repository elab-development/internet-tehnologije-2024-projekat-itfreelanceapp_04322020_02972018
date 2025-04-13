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
  IconButton
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
        setOrders(data.data); // Assuming the API response has a data property
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

  const handleOrderDetail = (id) => {
    navigate(`/orders/${id}`);
  };

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default Orders; 