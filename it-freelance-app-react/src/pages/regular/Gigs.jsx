import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Typography,
  InputAdornment,
  Chip,
  Stack
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import Card from '../../components/Card';
import animationData from '../../animations/animation3.json';

const ITEMS_PER_PAGE = 9;

const sortOptions = [
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('price_low');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/gigs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch gigs');
        }

        const data = await response.json();
        // Ensure we're working with an array
        const gigsArray = Array.isArray(data.data) ? data.data : [];
        setGigs(gigsArray);
        setFilteredGigs(gigsArray);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(gigsArray.map(gig => gig.category))];
        setCategories(['all', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching gigs:', error);
        setGigs([]);
        setFilteredGigs([]);
      }
    };

    fetchGigs();
  }, []);

  useEffect(() => {
    let result = [...gigs];

    // Apply search filter
    if (search) {
      result = result.filter(gig =>
        gig.title.toLowerCase().includes(search.toLowerCase()) ||
        gig.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category !== 'all') {
      result = result.filter(gig => gig.category === category);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.price - b.price; // Default to price low to high
      }
    });

    setFilteredGigs(result);
    setPage(1); // Reset to first page when filters change
  }, [gigs, search, sort, category]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedGigs = filteredGigs.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredGigs.length / ITEMS_PER_PAGE);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        pt: 10,
        pb: 4,
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
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search gigs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#000' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#000', borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth sx={{ minWidth: '250px' }}>
                  <InputLabel sx={{ color: '#000' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterListIcon fontSize="small" sx={{ color: '#000' }} />
                      Category
                    </Box>
                  </InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      height: '56px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000', borderWidth: '2px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '& .MuiSelect-icon': { color: '#000' },
                    }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ minWidth: '250px' }}>
                  <InputLabel sx={{ color: '#000' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SortIcon fontSize="small" sx={{ color: '#000' }} />
                      Sort By
                    </Box>
                  </InputLabel>
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    label="Sort By"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      height: '56px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000', borderWidth: '2px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '& .MuiSelect-icon': { color: '#000' },
                    }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>

          {/* Active Filters */}
          {(category !== 'all' || search) && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#000' }}>
                Active Filters:
              </Typography>
              {category !== 'all' && (
                <Chip
                  label={`Category: ${category}`}
                  onDelete={() => setCategory('all')}
                  size="small"
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '& .MuiChip-deleteIcon': {
                      color: '#fff',
                      '&:hover': { color: '#ccc' }
                    }
                  }}
                />
              )}
              {search && (
                <Chip
                  label={`Search: ${search}`}
                  onDelete={() => setSearch('')}
                  size="small"
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '& .MuiChip-deleteIcon': {
                      color: '#fff',
                      '&:hover': { color: '#ccc' }
                    }
                  }}
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Results Count */}
        <Typography variant="body2" sx={{ color: '#000', mb: 2 }}>
          Showing {displayedGigs.length} of {filteredGigs.length} gigs
        </Typography>

        {/* Gigs Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {displayedGigs.map((gig) => (
            <Grid item xs={12} sm={6} md={4} key={gig.id}>
              <Card gig={gig} />
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="standard"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#000',
                  borderColor: '#000',
                  '&.Mui-selected': {
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#000',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  }
                },
                // Override the blue focus color
                '& .MuiButtonBase-root:focus': {
                  outline: 'none',
                },
                // Ensure the pagination numbers are black
                '& .MuiButtonBase-root.MuiPaginationItem-page': {
                  color: '#000',
                },
                // Override the Material-UI blue focus ring
                '& .MuiButtonBase-root.MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: '#000',
                  color: '#fff',
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Gigs; 