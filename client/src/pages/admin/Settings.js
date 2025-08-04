import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Perfumes Plug',
    storeEmail: 'contact@perfumesplug.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Fragrance Ave, New York, NY 10001',
    currencySymbol: '$',
    taxRate: 8.5,
    enableReviews: true,
    enableWishlist: true,
    enableGuestCheckout: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'notifications@perfumesplug.com',
    smtpPassword: '********',
    senderName: 'Perfumes Plug',
    senderEmail: 'notifications@perfumesplug.com',
    enableOrderConfirmation: true,
    enableShippingNotification: true,
    enableMarketingEmails: true,
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Credit Card', enabled: true },
    { id: 2, name: 'PayPal', enabled: true },
    { id: 3, name: 'Cash on Delivery', enabled: true },
  ]);

  const [shippingMethods, setShippingMethods] = useState([
    { id: 1, name: 'Standard Shipping', price: 5.99, estimatedDays: '3-5', enabled: true },
    { id: 2, name: 'Express Shipping', price: 12.99, estimatedDays: '1-2', enabled: true },
    { id: 3, name: 'Free Shipping', price: 0, estimatedDays: '5-7', enabled: true, minimumOrderAmount: 50 },
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleGeneralSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: name.startsWith('enable') ? checked : value
    }));
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: name.startsWith('enable') ? checked : value
    }));
  };

  const togglePaymentMethod = (id) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const toggleShippingMethod = (id) => {
    setShippingMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Store Settings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save All Settings
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="General Settings" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Name"
                      name="storeName"
                      value={generalSettings.storeName}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Email"
                      name="storeEmail"
                      value={generalSettings.storeEmail}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Phone"
                      name="storePhone"
                      value={generalSettings.storePhone}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Store Address"
                      name="storeAddress"
                      value={generalSettings.storeAddress}
                      onChange={handleGeneralSettingsChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Currency Symbol"
                      name="currencySymbol"
                      value={generalSettings.currencySymbol}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Tax Rate (%)"
                      name="taxRate"
                      type="number"
                      value={generalSettings.taxRate}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.enableReviews}
                          onChange={handleGeneralSettingsChange}
                          name="enableReviews"
                        />
                      }
                      label="Enable Product Reviews"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.enableWishlist}
                          onChange={handleGeneralSettingsChange}
                          name="enableWishlist"
                        />
                      }
                      label="Enable Wishlist Feature"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.enableGuestCheckout}
                          onChange={handleGeneralSettingsChange}
                          name="enableGuestCheckout"
                        />
                      }
                      label="Enable Guest Checkout"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Email Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Email Settings" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="SMTP Server"
                      name="smtpServer"
                      value={emailSettings.smtpServer}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      name="smtpPort"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      name="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      name="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Sender Name"
                      name="senderName"
                      value={emailSettings.senderName}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Sender Email"
                      name="senderEmail"
                      value={emailSettings.senderEmail}
                      onChange={handleEmailSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Email Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailSettings.enableOrderConfirmation}
                          onChange={handleEmailSettingsChange}
                          name="enableOrderConfirmation"
                        />
                      }
                      label="Order Confirmation"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailSettings.enableShippingNotification}
                          onChange={handleEmailSettingsChange}
                          name="enableShippingNotification"
                        />
                      }
                      label="Shipping Notification"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailSettings.enableMarketingEmails}
                          onChange={handleEmailSettingsChange}
                          name="enableMarketingEmails"
                        />
                      }
                      label="Marketing Emails"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Payment Methods" 
                action={
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {}}
                  >
                    Add Method
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {paymentMethods.map((method) => (
                    <ListItem key={method.id}>
                      <ListItemText primary={method.name} />
                      <ListItemSecondaryAction>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={method.enabled}
                              onChange={() => togglePaymentMethod(method.id)}
                              name={`payment-${method.id}`}
                            />
                          }
                          label=""
                        />
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Shipping Methods */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Shipping Methods" 
                action={
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {}}
                  >
                    Add Method
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {shippingMethods.map((method) => (
                    <ListItem key={method.id}>
                      <ListItemText 
                        primary={method.name} 
                        secondary={`${generalSettings.currencySymbol}${method.price.toFixed(2)} • ${method.estimatedDays} days${method.minimumOrderAmount ? ` • Min. Order: ${generalSettings.currencySymbol}${method.minimumOrderAmount}` : ''}`} 
                      />
                      <ListItemSecondaryAction>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={method.enabled}
                              onChange={() => toggleShippingMethod(method.id)}
                              name={`shipping-${method.id}`}
                            />
                          }
                          label=""
                        />
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default Settings;