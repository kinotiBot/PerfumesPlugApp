import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Person, Lock, LocationOn } from '@mui/icons-material';
import { getUserProfile, updateUserProfile } from '../features/auth/authSlice';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  
  const { user, loading, error, success } = useSelector((state) => state.auth);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=profile');
      return;
    }
    
    dispatch(getUserProfile());
  }, [dispatch, isAuthenticated, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const profileFormik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      username: Yup.string().required('Username is required'),
    }),
    onSubmit: (values) => {
      dispatch(updateUserProfile(values));
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required('Current password is required'),
      new_password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: (values) => {
      dispatch(
        updateUserProfile({
          current_password: values.current_password,
          new_password: values.new_password,
        })
      );
      passwordFormik.resetForm();
    },
  });

  if (loading && !user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
            >
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {user?.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Account Information
              </Typography>
              <Typography variant="body2" paragraph>
                Username: {user?.username}
              </Typography>
              <Typography variant="body2" paragraph>
                Member since:{' '}
                {user?.date_joined
                  ? new Date(user.date_joined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<Person />} label="Profile" />
              <Tab icon={<Lock />} label="Password" />
              <Tab icon={<LocationOn />} label="Addresses" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {error && (
                <Typography color="error" paragraph>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography color="success.main" paragraph>
                  Profile updated successfully!
                </Typography>
              )}
              <Box
                component="form"
                onSubmit={profileFormik.handleSubmit}
                noValidate
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="first_name"
                      name="first_name"
                      label="First Name"
                      value={profileFormik.values.first_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.first_name &&
                        Boolean(profileFormik.errors.first_name)
                      }
                      helperText={
                        profileFormik.touched.first_name &&
                        profileFormik.errors.first_name
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="last_name"
                      name="last_name"
                      label="Last Name"
                      value={profileFormik.values.last_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.last_name &&
                        Boolean(profileFormik.errors.last_name)
                      }
                      helperText={
                        profileFormik.touched.last_name &&
                        profileFormik.errors.last_name
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.email &&
                        Boolean(profileFormik.errors.email)
                      }
                      helperText={
                        profileFormik.touched.email && profileFormik.errors.email
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      value={profileFormik.values.username}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.username &&
                        Boolean(profileFormik.errors.username)
                      }
                      helperText={
                        profileFormik.touched.username &&
                        profileFormik.errors.username
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {error && (
                <Typography color="error" paragraph>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography color="success.main" paragraph>
                  Password updated successfully!
                </Typography>
              )}
              <Box
                component="form"
                onSubmit={passwordFormik.handleSubmit}
                noValidate
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="current_password"
                      name="current_password"
                      label="Current Password"
                      type="password"
                      value={passwordFormik.values.current_password}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={
                        passwordFormik.touched.current_password &&
                        Boolean(passwordFormik.errors.current_password)
                      }
                      helperText={
                        passwordFormik.touched.current_password &&
                        passwordFormik.errors.current_password
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="new_password"
                      name="new_password"
                      label="New Password"
                      type="password"
                      value={passwordFormik.values.new_password}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={
                        passwordFormik.touched.new_password &&
                        Boolean(passwordFormik.errors.new_password)
                      }
                      helperText={
                        passwordFormik.touched.new_password &&
                        passwordFormik.errors.new_password
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="confirm_password"
                      name="confirm_password"
                      label="Confirm New Password"
                      type="password"
                      value={passwordFormik.values.confirm_password}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={
                        passwordFormik.touched.confirm_password &&
                        Boolean(passwordFormik.errors.confirm_password)
                      }
                      helperText={
                        passwordFormik.touched.confirm_password &&
                        passwordFormik.errors.confirm_password
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Password'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Manage Addresses
              </Typography>
              <Typography variant="body2" paragraph>
                You can add, edit, or remove your shipping and billing addresses here.
              </Typography>
              <Button variant="contained" color="primary">
                Add New Address
              </Button>
              <Typography variant="body2" sx={{ mt: 3 }}>
                No addresses found. Add a new address to get started.
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;