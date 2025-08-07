import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const GuestCheckoutForm = ({ onGuestInfoChange, guestInfo }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const updatedInfo = {
      ...guestInfo,
      [field]: value
    };
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    onGuestInfoChange(updatedInfo);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleBlur = (field) => (event) => {
    const value = event.target.value;
    let error = null;

    switch (field) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        }
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!validatePhone(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Contact & Shipping Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please provide your contact details to complete your order.
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={guestInfo.firstName || ''}
            onChange={handleChange('firstName')}
            onBlur={handleBlur('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={guestInfo.lastName || ''}
            onChange={handleChange('lastName')}
            onBlur={handleBlur('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={guestInfo.email || ''}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={!!errors.email}
            helperText={errors.email || 'We\'ll send order confirmation to this email'}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            value={guestInfo.phone || ''}
            onChange={handleChange('phone')}
            onBlur={handleBlur('phone')}
            error={!!errors.phone}
            helperText={errors.phone || 'For delivery coordination'}
            placeholder="+250 XXX XXX XXX"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={guestInfo.address || ''}
            onChange={handleChange('address')}
            onBlur={handleBlur('address')}
            error={!!errors.address}
            helperText={errors.address}
            multiline
            rows={2}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={guestInfo.city || ''}
            onChange={handleChange('city')}
            onBlur={handleBlur('city')}
            error={!!errors.city}
            helperText={errors.city}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Province</InputLabel>
            <Select
              value={guestInfo.province || ''}
              onChange={handleChange('province')}
              label="Province"
            >
              <MenuItem value="Kigali">Kigali</MenuItem>
              <MenuItem value="Eastern">Eastern</MenuItem>
              <MenuItem value="Northern">Northern</MenuItem>
              <MenuItem value="Southern">Southern</MenuItem>
              <MenuItem value="Western">Western</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            value={guestInfo.notes || ''}
            onChange={handleChange('notes')}
            multiline
            rows={2}
            placeholder="Any special delivery instructions..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GuestCheckoutForm;