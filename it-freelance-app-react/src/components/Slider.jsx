import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Box } from '@mui/material';

const imageCount = 10;
const images = Array.from({ length: imageCount }, (_, i) => `/images/slider-images/slider${i + 1}.jpg`);

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 1000,
  autoplay: true,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  fade: true,
  cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  pauseOnHover: true,
  arrows: false,
  dotsClass: 'slick-dots custom-dots'
};

const CustomSlider = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        '& .slick-slide': {
          transition: 'all 0.5s ease-in-out',
        },
        '& .slick-active': {
          '& img': {
            transform: 'scale(1.02)',
            transition: 'transform 0.5s ease-in-out',
          }
        },
        '& .custom-dots': {
          bottom: '-40px',
          '& li': {
            margin: '0 4px',
            '& button': {
              width: '10px',
              height: '10px',
              padding: 0,
              '&:before': {
                fontSize: '10px',
                color: '#000',
                opacity: 0.3,
                transition: 'all 0.3s ease',
              }
            },
            '&.slick-active button:before': {
              color: '#000',
              opacity: 1,
              transform: 'scale(1.2)',
            }
          }
        }
      }}
    >
      <Slider {...sliderSettings}>
        {images.map((src, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              '&:hover': {
                '& img': {
                  transform: 'scale(1.05)',
                }
              }
            }}
          >
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                transition: 'transform 0.5s ease-in-out',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                '&:hover': {
                  opacity: 1,
                }
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default CustomSlider;
