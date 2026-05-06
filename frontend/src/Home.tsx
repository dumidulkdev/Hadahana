import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';
import LocationPicker from './LocationPicker';

const API_BASE_URL = 'http://localhost:3000';

export default function Home() {
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
    } catch (error: any) {
      console.error(error);
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error('Unable to connect to the server. Please check if the backend is running.', { duration: 5000 });
      } else {
        const detail = error.response?.data?.message || error.message;
        toast.error(`Request failed: ${detail}`, { duration: 5000 });
      }
      setPollingStatus('');
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let pollErrorCount = 0;

    if (jobId) {
      setPollingStatus('Computing astronomical data and synthesis...');
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/user/reading/${jobId}`);
          pollErrorCount = 0; 
          
          if (res.data.state === 'COMPLETE') {
            setReading(res.data.reading);
            setJobId(null);
            setLoading(false);
            setPollingStatus('');
            toast.success('Your reading is ready!', { duration: 3000 });
          } else if (res.data.state === 'FAILED') {
            toast.error('Currently experiencing high demand. Please try again in a few minutes.', {
              duration: 6000,
              icon: '🔥',
            });
            setPollingStatus('');
            setJobId(null);
            setLoading(false);
          }
        } catch (error: any) {
          pollErrorCount++;
          console.error('Polling error', error);
          if (pollErrorCount >= 5) {
            toast.error('Lost connection to the server. Please check your network and try again.', { duration: 5000 });
            setJobId(null);
            setLoading(false);
            setPollingStatus('');
          }
        }
      }, 3000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId]);

  const handleDownload = () => {
    if (!reading) return;
    const blob = new Blob([reading], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hadahana_Reading_${formData.dateOfBirth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2].replace(/\*\*/g, ''); 
        return (
          <Typography 
            key={index} 
            variant={level <= 2 ? "h5" : "h6"} 
            sx={{ mt: 3, mb: 1, fontWeight: 700, color: '#1a1a1a' }}
          >
            {content}
          </Typography>
        );
      }

      if (/^[0-9]+\.|^\*/.test(line.trim()) && !line.includes('**')) {
        return (
          <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.8, ml: 2 }}>
            {line}
          </Typography>
        );
      }

      const parts = line.split(/\*\*(.*?)\*\*/g);
      
      return (
        <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.8 }}>
          {parts.map((part, i) => (
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
          ))}
        </Typography>
      );
    });
  };

  return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Form Section */}
          <Box sx={{ width: { xs: '100%', md: '35%' } }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Generate Horoscope
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Enter the exact birth details to calculate planetary positions and generate a comprehensive reading.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Time of Birth"
                    type="time"
                    name="timeOfBirth"
                    value={formData.timeOfBirth}
                    onChange={handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                  />
                </Box>
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
                
                <LocationPicker 
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(lat, lng) => setFormData(prev => ({...prev, latitude: lat, longitude: lng}))}
                />

                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 1, 
                    textAlign: 'center', 
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    opacity: 0.8,
                  }}
                >
                  The accuracy of this reading depends on your exact birth time and the precise location you choose.
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 1, py: 1.5 }}
                >
                  {loading ? 'Processing...' : 'Compute Horoscope'}
                </Button>
              </Box>
            </form>
          </Box>

          {/* Reading Result Section */}
          <Box sx={{ width: { xs: '100%', md: '65%' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%', 
                border: '1px solid #eaeaea', 
                borderRadius: 3,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fafafa',
                maxHeight: '85vh',
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
                    Please wait. This may take up to 90 seconds depending on API limits.
                  </Typography>
                </Box>
              )}

              {reading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '2px solid #1a1a1a', pb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Astrological Reading
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small" 
                      onClick={handleDownload}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Download as .txt
                    </Button>
                  </Box>
                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto', 
                      pr: 2,
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
                      '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '4px' },
                      '&::-webkit-scrollbar-thumb:hover': { background: '#999' }
                    }}
                  >
                    {renderFormattedText(reading)}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
  );
}
