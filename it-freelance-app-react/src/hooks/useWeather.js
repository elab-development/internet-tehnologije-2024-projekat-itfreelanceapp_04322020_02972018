import { useState, useEffect } from 'react';

const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Belgrade coordinates
  const latitude = 44.8125;
  const longitude = 20.4612;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // API URL for current weather in Belgrade
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Process weather data
        const weatherData = {
          temperature: data.current.temperature_2m,
          temperatureUnit: data.current_units.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          humidityUnit: data.current_units.relative_humidity_2m,
          isDay: data.current.is_day,
          precipitation: data.current.precipitation,
          weatherCode: data.current.weather_code,
          cloudCover: data.current.cloud_cover,
          windSpeed: data.current.wind_speed_10m,
          windSpeedUnit: data.current_units.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
          time: new Date(data.current.time),
          location: 'Belgrade, Serbia'
        };
        
        // Get weather type based on code
        weatherData.weatherType = getWeatherType(weatherData.weatherCode, weatherData.isDay);
        
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Map weather codes to types and animation
  const getWeatherType = (code, isDay) => {
    // Weather code mappings based on WMO codes
    // https://open-meteo.com/en/docs
    
    // Clear
    if (code === 0) {
      return {
        description: isDay ? 'Clear sky' : 'Clear night',
        icon: isDay ? 'clear-day' : 'clear-night'
      };
    }
    
    // Partly cloudy
    if (code === 1 || code === 2) {
      return {
        description: isDay ? 'Partly cloudy' : 'Partly cloudy night',
        icon: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
      };
    }
    
    // Cloudy / Overcast
    if (code === 3) {
      return {
        description: 'Cloudy',
        icon: 'cloudy'
      };
    }
    
    // Fog
    if (code >= 45 && code <= 48) {
      return {
        description: 'Foggy',
        icon: 'fog'
      };
    }
    
    // Drizzle
    if (code >= 51 && code <= 53) {
      return {
        description: 'Light drizzle',
        icon: 'drizzle'
      };
    }
    
    if (code >= 55 && code <= 57) {
      return {
        description: 'Heavy drizzle',
        icon: 'drizzle'
      };
    }
    
    // Rain
    if (code >= 61 && code <= 63) {
      return {
        description: 'Light rain',
        icon: 'rain'
      };
    }
    
    if (code >= 65 && code <= 67) {
      return {
        description: 'Heavy rain',
        icon: 'rain'
      };
    }
    
    // Snow
    if (code >= 71 && code <= 73) {
      return {
        description: 'Light snow',
        icon: 'snow'
      };
    }
    
    if (code >= 75 && code <= 77) {
      return {
        description: 'Heavy snow',
        icon: 'snow'
      };
    }
    
    // Thunderstorm
    if (code >= 95 && code <= 99) {
      return {
        description: 'Thunderstorm',
        icon: 'thunderstorm'
      };
    }
    
    // Default
    return {
      description: 'Unknown',
      icon: 'cloudy'
    };
  };
  
  return { weather, loading, error };
};

export default useWeather; 