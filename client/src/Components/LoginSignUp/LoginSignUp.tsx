import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import mainInstance from '../../services/networkAdapters/mainAxiosInstance';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/actions/userActions';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleToggleView = () => {
    navigate(isLogin ? '/signup' : '/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill all required fields');
      }

      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.name) {
          throw new Error('Name is required');
        }
      }

      const response = await mainInstance.post(`/auth/${isLogin ? "login" : "register"}`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmPassword: formData.confirmPassword
      });

      dispatch(login(response.data.data, response.data.data.token));
      localStorage.setItem("token", response.data.data.token);
    
      navigate("/");
    } catch (err: unknown) {
        if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else if (err.message) {
            setError(err.message);
        } else {
            setError("Something went wrong");
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    setIsLogin(path.includes("login"));
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) {
      navigate("/");
    }
  }, []);

  return (
    <Container component="main" maxWidth="xs" className="min-h-screen flex items-center justify-center">
      <Paper elevation={3} className="p-8 rounded-lg">
        <Box className="flex flex-col items-center">
          <Typography component="h1" variant="h5" className="mb-4">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Typography>
          
          {error && (
            <Alert severity="error" className="mb-4 w-full">
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} className="w-full">
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
                className="mb-4"
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type='email'
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                variant="outlined"
                className="mb-4"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              className="mt-4 py-3"
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </Button>
            
            <Grid container className="mt-4">
              <Grid item>
                <Link 
                  href="#" 
                  onClick={handleToggleView} 
                  variant="body2"
                  className="text-blue-600 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;