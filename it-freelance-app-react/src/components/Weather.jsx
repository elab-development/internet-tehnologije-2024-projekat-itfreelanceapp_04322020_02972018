import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Skeleton,
  Divider,
  CircularProgress 
} from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import useWeather from '../hooks/useWeather';

import clearDayAnimation from '../animations/weather/clear-day.json';
import cloudyAnimation from '../animations/weather/cloudy.json';
import rainAnimation from '../animations/weather/rain.json';

const Weather = () => {
  const { weather, loading, error } = useWeather();

  const getAnimationForWeather = (weatherType) => {
    if (!weatherType) return cloudyAnimation;

    switch (weatherType.icon) {
      case 'clear-day':
      case 'clear-night':
        return clearDayAnimation;
      case 'rain':
      case 'drizzle':
        return rainAnimation;
      case 'cloudy':
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
      default:
        return cloudyAnimation;
    }
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 4, 
        border: '2px solid #000',
        height: '100%',
        transition: 'transform 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Belgrade Weather
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 4 }}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body1">Loading weather data...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2, mt: 2 }}>
            <Typography variant="body1" color="error">
              Error loading weather data: {error}
            </Typography>
          </Box>
        )}
        
        {weather && (
          <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              position: 'relative',
              zIndex: 2
            }}>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {Math.round(weather.temperature)}{weather.temperatureUnit}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Feels like {Math.round(weather.apparentTemperature)}°
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {weather.weatherType.description}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" fontWeight="medium" textAlign="right">
                  {weather.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="right" sx={{ marginLeft:'30px' }}>
                  {weather.time.toLocaleDateString([], { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ position: 'relative', height: 140, width: '100%', my: 2, marginBottom: '80px', marginTop:'-50px' }}>
              <Player
                src={getAnimationForWeather(weather.weatherType)}
                autoplay
                loop
                style={{ height: '100%', width: '100%' }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {weather.humidity}%
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Wind
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {weather.windSpeed} {weather.windSpeedUnit}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cloud Cover
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {weather.cloudCover}%
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Weather; 