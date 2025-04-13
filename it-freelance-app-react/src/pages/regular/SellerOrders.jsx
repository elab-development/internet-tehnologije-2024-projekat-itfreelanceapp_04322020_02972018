import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import animationData from '../../animations/animation4.json';

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState({
    open: false,
    orderId: null,
    status: '',
    title: ''
  });

  const fetchOrders = useCallback(async () => {
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
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const goBack = () => {
    navigate('/seller-home');
  };

  const openDialog = (orderId, status, title) => {
    setDialog({
      open: true,
      orderId,
      status,
      title
    });
  };

  const closeDialog = () => {
    setDialog({
      ...dialog,
      open: false
    });
  };

  const handleUpdateStatus = async () => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem('token');

      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/orders/${dialog.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: dialog.status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === dialog.orderId ? { ...order, status: dialog.status } : order
        )
      );

      closeDialog();
      alert(`Order status has been updated to ${dialog.status}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
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
          opacity: 0.05,
          transform: 'scale(1.5)',
          pointerEvents: 'none'
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
        {/* Title */}
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
          Orders for My Gigs
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
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Buyer</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
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
                    <TableCell sx={{ color: '#000' }}>{order.buyer.name}</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>${order.gig.price}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      {order.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => openDialog(order.id, 'completed', `Complete order for "${order.gig.title}"`)}
                            sx={{ 
                              borderWidth: 2,
                              fontWeight: 'bold',
                              '&:hover': { borderWidth: 2 }
                            }}
                          >
                            Complete
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => openDialog(order.id, 'cancelled', `Cancel order for "${order.gig.title}"`)}
                            sx={{ 
                              borderWidth: 2,
                              fontWeight: 'bold',
                              '&:hover': { borderWidth: 2 }
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                      {order.status !== 'pending' && (
                        <Typography variant="body2" color="text.secondary">
                          No actions available
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

      {/* Confirmation Dialog */}
      <Dialog
        open={dialog.open}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialog.status === 'completed' ? 
              "Are you sure you want to mark this order as completed? This indicates that you've delivered the work to the buyer's satisfaction." :
              "Are you sure you want to cancel this order? This action cannot be undone."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeDialog} 
            sx={{ color: '#000' }}
            disabled={actionLoading}
          >
            No, Go Back
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            autoFocus
            disabled={actionLoading}
            variant="contained"
            color={dialog.status === 'completed' ? 'success' : 'error'}
            sx={{ fontWeight: 'bold' }}
          >
            {actionLoading ? 'Processing...' : `Yes, ${dialog.status === 'completed' ? 'Complete' : 'Cancel'} Order`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOrders; 