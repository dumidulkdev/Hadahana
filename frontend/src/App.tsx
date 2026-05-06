import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './Home';
import About from './About';

export default function App() {
  const location = useLocation();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { fontFamily: 'inherit', fontSize: '14px', borderRadius: '10px', padding: '12px 20px' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }, duration: 5000 },
        }}
      />
      <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: '1px solid #eaeaea' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, textDecoration: 'none', color: 'inherit' }}
          >
            HADAHANA
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              component={RouterLink} 
              to="/" 
              color="inherit"
              sx={{ fontWeight: location.pathname === '/' ? 700 : 400, opacity: location.pathname === '/' ? 1 : 0.7 }}
            >
              Generate
            </Button>
            <Button 
              component={RouterLink} 
              to="/about-project" 
              color="inherit"
              sx={{ fontWeight: location.pathname === '/about-project' ? 700 : 400, opacity: location.pathname === '/about-project' ? 1 : 0.7 }}
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-project" element={<About />} />
      </Routes>
    </Box>
  );
}
