import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Card = ({ gig }) => {
  const navigate = useNavigate();

  return (
    <MuiCard
      sx={{
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          '& .hover-reveal': {
            opacity: 1,
          }
        },
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #000',
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={`https://picsum.photos/seed/${gig.id}/345/200`}
        alt={gig.title}
        sx={{
          objectFit: 'cover',
        }}
      />
      
      <Box
        className="hover-reveal"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          p: 2,
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <Chip
          label={gig.category}
          sx={{
            bgcolor: '#000',
            color: 'white',
            fontWeight: 600,
            maxWidth: '180px',
            height: 'auto',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              display: 'block',
              padding: '8px 12px',
              lineHeight: 1.2,
            },
          }}
        />
        <Chip
          label={gig.user.name}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            fontWeight: 500,
            color: '#000',
            border: '1px solid #000',
            maxWidth: '120px',
            height: 'auto',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              display: 'block',
              padding: '8px 12px',
              lineHeight: 1.2,
            },
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '3.6em',
            color: '#000',
          }}
        >
          {gig.title}
        </Typography>

        <Typography
          variant="body2"
          color="#000"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1
          }}
        >
          {gig.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
          {gig.feedback && (
            <Typography variant="body2" color="#000">
              ({gig.feedback})
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" sx={{ color: '#000' }} />
            <Typography variant="body2" color="#000">
              <span style={{ fontWeight: 'bold' }}>{gig.delivery_time}</span> days
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoneyIcon fontSize="small" sx={{ color: '#000' }} />
            <Typography variant="body2" color="#000">
              Starting at <span style={{ fontWeight: 'bold' }}>${gig.price}</span>
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            mt: 'auto',
            textTransform: 'none',
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            color: '#000',
            backgroundColor: 'transparent',
            borderColor: '#000',
            borderWidth: '2px',
            '&:hover': {
              backgroundColor: '#000',
              color: '#fff',
              borderColor: '#000',
            }
          }}
          onClick={() => navigate(`/gigs/${gig.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </MuiCard>
  );
};

export default Card; 