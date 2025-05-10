import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navigation from './components/Navigation';
import Breadcrumbs from './components/Breadcrumbs';
import Footer from './components/Footer';
import Auth from './pages/authentification/Auth';
import BuyerHome from './pages/regular/BuyerHome';
import Gigs from './pages/regular/Gigs';
import GigDetails from './pages/regular/GigDetails';
import Orders from './pages/regular/Orders';
import SellerHome from './pages/regular/SellerHome';
import MyGigs from './pages/regular/MyGigs';
import SellerOrders from './pages/regular/SellerOrders';
import AdministratorHome from './pages/regular/AdministratorHome';
import AppMetrics from './pages/regular/AppMetrics';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#000000',
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      if (token && user) {
        setIsLoggedIn(true);
        setUserRole(JSON.parse(user).role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    // Check initially
    checkLoginStatus();

    // Check every second
    const interval = setInterval(checkLoginStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {isLoggedIn && <Navigation />}
          {isLoggedIn && <Breadcrumbs />}
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/buyer-home" 
                element={
                  isLoggedIn ? <BuyerHome /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/gigs" 
                element={
                  isLoggedIn ? <Gigs /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/gigs/:id" 
                element={
                  isLoggedIn ? <GigDetails /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/orders" 
                element={
                  isLoggedIn ? <Orders /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/seller-home" 
                element={
                  isLoggedIn ? <SellerHome /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/my-gigs" 
                element={
                  isLoggedIn ? <MyGigs /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/seller-orders" 
                element={
                  isLoggedIn ? <SellerOrders /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/administrator-home" 
                element={
                  isLoggedIn ? <AdministratorHome /> : <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/app-metrics" 
                element={
                  isLoggedIn ? <AppMetrics /> : <Navigate to="/auth" replace />
                } 
              />
            </Routes>
          </Box>
          {isLoggedIn && <Footer />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
