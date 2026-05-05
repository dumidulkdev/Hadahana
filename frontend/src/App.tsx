import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Make sure backend is running

export default function App() {
  const [formData, setFormData] = useState({
    dateOfBirth: '1990-01-01',
    timeOfBirth: '12:00',
    gender: 'male',
    latitude: 6.9271,
    longitude: 79.8612,
  });

  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReading(null);
    setPollingStatus('Initializing calculation engine...');
    
    try {
      const payload = {
        dateOfBirth: formData.dateOfBirth,
        timeOfBirth: formData.timeOfBirth,
        gender: formData.gender,
        birth_place: {
          latitude: parseFloat(formData.latitude.toString()),
          longitude: parseFloat(formData.longitude.toString()),
        },
      };

      const res = await axios.post(`${API_BASE_URL}/user/analyse`, payload);
      if (res.data && res.data.job_id) {
        setJobId(res.data.job_id);
      } else {
        throw new Error('Failed to retrieve job ID');
      }
    } catch (error) {
      console.error(error);
      setPollingStatus('Error connecting to the service. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobId) {
      setPollingStatus('Computing astronomical data and synthesis...');
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/user/reading/${jobId}`);
          
          if (res.data.state === 'COMPLETE') {
            setReading(res.data.reading);
            setJobId(null);
            setLoading(false);
            setPollingStatus('');
          } else if (res.data.state === 'FAILED') {
            setPollingStatus('Processing failed. Please check inputs.');
            setJobId(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Polling error', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId]);

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: '1px solid #eaeaea' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            HADAHANA
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 6, mb: 6, flexGrow: 1 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Generate Horoscope
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Enter the exact birth details to calculate planetary positions and generate a comprehensive reading based on the Lahiri Ayanamsha.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time of Birth"
                    type="time"
                    name="timeOfBirth"
                    value={formData.timeOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    inputProps={{ step: "0.0001" }}
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    inputProps={{ step: "0.0001" }}
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {loading ? 'Processing...' : 'Compute Horoscope'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%', 
                minHeight: 400, 
                border: '1px solid #eaeaea', 
                borderRadius: 3,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fafafa'
              }}
            >
              {!loading && !reading && (
                <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.5 }}>
                  <Typography variant="body1">
                    Your reading will appear here once computation is complete.
                  </Typography>
                </Box>
              )}

              {loading && (
                <Box sx={{ m: 'auto', textAlign: 'center' }}>
                  <CircularProgress size={40} thickness={4} sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pollingStatus}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please wait. This may take up to 30 seconds.
                  </Typography>
                </Box>
              )}

              {reading && (
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, borderBottom: '2px solid #1a1a1a', pb: 1, display: 'inline-block' }}>
                    Astrological Reading
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {reading.split('\\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return <br key={index} />;
                      // Make headers bold if they start with numbers or asterisks
                      if (/^[0-9]+\.|^\*\*/.test(paragraph.trim())) {
                         return (
                           <Typography key={index} variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600, fontSize: '1.1rem' }}>
                             {paragraph.replace(/\\*/g, '')}
                           </Typography>
                         )
                      }
                      return (
                        <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.8 }}>
                          {paragraph.replace(/\\*/g, '')}
                        </Typography>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
