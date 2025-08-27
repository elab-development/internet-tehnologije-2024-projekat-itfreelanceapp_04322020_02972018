import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import animationData from '../../animations/animation4.json';

const MyGigs = () => {
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [categories] = useState([
    'Web Development', 'Mobile Development', 'UI/UX Design', 
    'Data Science', 'DevOps', 'Blockchain', 'Game Development'
  ]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    delivery_time: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    
    fetchMyGigs();
  }, []);

  const fetchMyGigs = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('http://127.0.0.1:8000/api/my-gigs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check your authentication.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch gigs');
      }
      
      // Use the data directly without filtering since backend now returns only the seller's gigs
      setGigs(data.data);
    } catch (err) {
      console.error('Error fetching gigs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
    setFormData({
      title: '',
      category: '',
      price: '',
      delivery_time: '',
      description: ''
    });
    setFormErrors({});
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || Number(formData.price) <= 0) 
      errors.price = 'Price must be a positive number';
    
    if (!formData.delivery_time) errors.delivery_time = 'Delivery time is required';
    else if (isNaN(formData.delivery_time) || Number(formData.delivery_time) <= 0) 
      errors.delivery_time = 'Delivery time must be a positive number';
    
    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.length < 10) 
      errors.description = 'Description must be at least 10 characters';
    
    return errors;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSubmitting(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/gigs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          price: Number(formData.price),
          delivery_time: Number(formData.delivery_time),
          description: formData.description
        })
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check your authentication.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create gig');
      }
      
      // Close dialog first for better perceived performance
      handleCloseDialog();
      
      // Then refresh gigs list
      await fetchMyGigs();
      
      alert('Gig created successfully!');
    } catch (err) {
      console.error('Error creating gig:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, handleCloseDialog, fetchMyGigs]);

  const handleDeleteGig = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) {
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/gigs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete gig');
      }
      
      // Update local state without re-fetching for better performance
      setGigs(prevGigs => prevGigs.filter(gig => gig.id !== id));
      
      alert('Gig deleted successfully!');
    } catch (err) {
      console.error('Error deleting gig:', err);
      alert(`Error: ${err.message}`);
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: '#fff',
        minHeight: '100vh',
        pt: 10,
        pb: 8
      }}
    >
      {/* Background Animation - with reduced opacity and performance optimizations */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.05, // Reduced opacity for better performance
          transform: 'scale(1.5)',
          pointerEvents: 'none' // Prevent any interaction with animation
        }}
      >
        <Player
          src={animationData}
          {...animationOptions}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: '#000',
              pb: 2,
              borderBottom: '2px solid #000'
            }}
          >
            My Gigs
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              },
              py: 1,
              px: 3
            }}
          >
            Create New Gig
          </Button>
        </Box>

        {gigs.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '2px dashed #000',
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#000' }}>
              You haven't created any gigs yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                }
              }}
            >
              Create Your First Gig
            </Button>
          </Paper>
        ) : (
          <Box sx={{ maxWidth: '100%' }}>
            <Grid container spacing={3} alignItems="stretch">
              {gigs.map((gig) => (
                <Grid item xs={12} sm={6} md={4} key={gig.id} sx={{ display: 'flex' }}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      width: '100%',
                      maxWidth: '350px',
                      minWidth: '350px',
                      height: '450px',
                      maxHeight: '450px',
                      minHeight: '450px',
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '2px solid #000',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      margin: '0 auto',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        height: '160px',
                        minHeight: '160px',
                        maxHeight: '160px',
                        objectFit: 'cover'
                      }}
                      image={`https://picsum.photos/seed/${gig.id}/500/300`}
                      alt={gig.title}
                      loading="lazy"
                    />
                    <CardContent 
                      sx={{ 
                        padding: 2,
                        height: '230px',
                        minHeight: '230px',
                        maxHeight: '230px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Chip 
                        label={gig.category} 
                        size="small"
                        sx={{ 
                          mb: 1, 
                          fontWeight: 'bold',
                          bgcolor: '#000',
                          color: '#fff',
                          maxWidth: '100%'
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        component="h2"
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 1,
                          color: '#000',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: '3em',
                          lineHeight: 1.5
                        }}
                      >
                        {gig.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 'auto',
                          height: '5.5em',
                          overflow: 'auto',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1',
                          '&::-webkit-scrollbar': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '10px',
                            '&:hover': {
                              background: '#555',
                            },
                          },
                          lineHeight: 1.4
                        }}
                      >
                        {gig.description}
                      </Typography>
                      <Box 
                        sx={{ 
                          width: '100%',
                          mt: 1,
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pt: 1
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                          ${gig.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {gig.delivery_time} days delivery
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions 
                      sx={{ 
                        p: 2, 
                        height: '60px',
                        minHeight: '60px',
                        maxHeight: '60px',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteGig(gig.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'rgba(211,47,47,0.1)' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {Number.isFinite(Number(gig.rating)) && (
                            <Typography
                              variant="body2"
                              sx={{ mr: 2, fontWeight: 'bold', color: '#000' }}
                            >
                              ★ {Number(gig.rating).toFixed(1)}
                            </Typography>
                          )}
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Create Gig Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 2 }}>
          Create New Gig
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            name="title"
            label="Gig Title"
            fullWidth
            margin="normal"
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
          <FormControl fullWidth margin="normal" error={!!formErrors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {formErrors.category && (
              <Typography variant="caption" color="error">
                {formErrors.category}
              </Typography>
            )}
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              name="price"
              label="Price ($)"
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.price}
              onChange={handleInputChange}
              error={!!formErrors.price}
              helperText={formErrors.price}
            />
            <TextField
              name="delivery_time"
              label="Delivery Time (days)"
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.delivery_time}
              onChange={handleInputChange}
              error={!!formErrors.delivery_time}
              helperText={formErrors.delivery_time}
            />
          </Box>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            {submitting ? 'Creating...' : 'Create Gig'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(MyGigs); 