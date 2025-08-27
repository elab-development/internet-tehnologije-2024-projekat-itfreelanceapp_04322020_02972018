import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  LinearProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../../animations/animation5.json';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Weather from '../../components/Weather';

const AppMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW: exporting state
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('http://127.0.0.1:8000/api/admin/orders/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Calculate percentages
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // NEW: export handler (uses existing route)
  const handleExport = async () => {
    try {
      setExporting(true);
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('http://127.0.0.1:8000/api/admin/orders/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        let msg = 'Failed to export orders';
        try {
          const errJson = await res.json();
          msg = errJson.message || errJson.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      // Download the Excel file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

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

      <Container maxWidth="lg" sx={{ 
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Title + Export button (button positioned to the right) */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              color: '#000',
              borderBottom: '2px solid #000',
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <AssessmentIcon fontSize="large" />
            Platform Metrics
          </Typography>

          {/* NEW: Export button aligned to the right of the header */}
          <Box sx={{ position: 'absolute', right: 0, top: 8 }}>
            <Button
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
              disabled={exporting}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'none',
                px: 2.5,
                py: 1,
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              {exporting ? 'Exporting…' : 'Export Orders'}
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
              Loading metrics...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4, width: '100%' }}>
            Error: {error}
          </Alert>
        )}

        {metrics && (
          <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', maxWidth: '1000px' }}>
            {/* Total Orders Card */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 4, 
                  border: '2px solid #000',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleAltIcon sx={{ fontSize: 40, mr: 2, color: '#000' }} />
                    <Typography variant="h5" fontWeight="bold">Total Orders</Typography>
                  </Box>
                  <Typography variant="h2" sx={{ textAlign: 'center', my: 3, fontWeight: 'bold' }}>
                    {metrics.total_orders}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2">Completed</Typography>
                        <Typography variant="h6" fontWeight="bold">{metrics.completed_orders}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PendingIcon color="warning" />
                        <Typography variant="body2">Pending</Typography>
                        <Typography variant="h6" fontWeight="bold">{metrics.pending_orders}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CancelIcon color="error" />
                        <Typography variant="body2">Cancelled</Typography>
                        <Typography variant="h6" fontWeight="bold">{metrics.cancelled_orders}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Card */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 4, 
                  border: '2px solid #000',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon sx={{ fontSize: 40, mr: 2, color: '#000' }} />
                    <Typography variant="h5" fontWeight="bold">Total Revenue</Typography>
                  </Box>
                  <Typography variant="h2" sx={{ textAlign: 'center', my: 3, fontWeight: 'bold', color: 'success.main' }}>
                    ${metrics.total_revenue.toLocaleString()}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Revenue from Completed Orders
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={100} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 'success.main'
                            }
                          }} 
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          100%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Weather Card */}
            <Grid item xs={12} md={6}>
              <Weather />
            </Grid>

            {/* Status Distribution Card */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 4, 
                  border: '2px solid #000',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" mb={3}>
                    Order Status Distribution
                  </Typography>
                  <Grid container spacing={2} direction="row">
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          borderLeft: '4px solid #4caf50'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          Completed Orders
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={calculatePercentage(metrics.completed_orders, metrics.total_orders)} 
                              size={60}
                              thickness={4}
                              sx={{ color: 'success.main' }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" fontWeight="bold">
                                {calculatePercentage(metrics.completed_orders, metrics.total_orders)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              {metrics.completed_orders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              of {metrics.total_orders} orders
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          borderLeft: '4px solid #ff9800'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          Pending Orders
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={calculatePercentage(metrics.pending_orders, metrics.total_orders)} 
                              size={60}
                              thickness={4}
                              sx={{ color: 'warning.main' }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" fontWeight="bold">
                                {calculatePercentage(metrics.pending_orders, metrics.total_orders)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              {metrics.pending_orders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              of {metrics.total_orders} orders
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          borderLeft: '4px solid #f44336'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          Cancelled Orders
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={calculatePercentage(metrics.cancelled_orders, metrics.total_orders)} 
                              size={60}
                              thickness={4}
                              sx={{ color: 'error.main' }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" fontWeight="bold">
                                {calculatePercentage(metrics.cancelled_orders, metrics.total_orders)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              {metrics.cancelled_orders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              of {metrics.total_orders} orders
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AppMetrics;
