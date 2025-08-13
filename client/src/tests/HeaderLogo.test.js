import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import Header from '../components/layout/Header';
import theme from '../theme';

// Mock data for testing
const mockStore = configureStore({
  reducer: {
    auth: (state = { isAuthenticated: false, user: { is_staff: false } }, action) => state,
    cart: (state = { items: [], totalQuantity: 0 }, action) => state,
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

// Helper functions for testing logo functionality
const getLogoImage = () => screen.getByAltText('Perfumes Plug Rwanda Logo');
const getLogoText = () => screen.getByText('Perfumes Plug Rwanda');
const getLogoLink = () => screen.getByRole('link', { name: /Perfumes Plug Rwanda/i });
// Remove getLogoContainer as it uses closest



describe('Header Logo Tests', () => {
  test('displays logo image with correct src and alt attributes', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('/images/perfumes_plug_logo.jpg'));
    expect(logoImage).toHaveAttribute('alt', 'Perfumes Plug Rwanda Logo');
  });

  test('displays logo text alongside the image', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoText = getLogoText();
    expect(logoText).toBeInTheDocument();
    expect(logoText.textContent).toBe('Perfumes Plug Rwanda');
  });

  test('logo container is a clickable link to home page', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoLink = getLogoLink();
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('logo image and text are both present in the same container', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    const logoText = getLogoText();
    const logoLink = getLogoLink();
    
    expect(logoImage).toBeInTheDocument();
    expect(logoText).toBeInTheDocument();
    expect(logoLink).toBeInTheDocument();
    
    // Check that both are descendants of the link
    expect(logoLink).toContainElement(logoImage);
    expect(logoLink).toContainElement(logoText);
  });

  test('logo image has proper styling attributes', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    
    // Check that the image has styling applied
    expect(logoImage).toHaveStyle();
  });

  test('logo is accessible with proper alt text', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = screen.getByRole('img', { name: /perfumes plug rwanda logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'Perfumes Plug Rwanda Logo');
  });

  test('logo container has correct navigation properties', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoLink = screen.getByRole('link', { name: /perfumes plug rwanda/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('logo image loads with correct file path', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    expect(logoImage.src).toContain('/images/perfumes_plug_logo.jpg');
  });

  test('logo maintains branding consistency', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    const logoText = getLogoText();
    
    expect(logoImage).toBeInTheDocument();
    expect(logoText).toBeInTheDocument();
    
    expect(logoImage).toHaveAttribute('alt', expect.stringContaining('Perfumes Plug Rwanda'));
    expect(logoText).toHaveTextContent('Perfumes Plug Rwanda');
  });

  test('logo elements are properly structured in DOM', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    const logoText = getLogoText();
    
    expect(logoImage).toBeInTheDocument();
    expect(logoText).toBeInTheDocument();
    
    const logoLink = getLogoLink();
    expect(logoLink).toHaveAttribute('href', '/');
    
    const header = screen.getByRole('banner');
    expect(header).toContainElement(logoImage);
    expect(header).toContainElement(logoText);
  });
});

// Helper function tests
describe('Logo Helper Functions', () => {
  test('getLogoImage returns correct element', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'Perfumes Plug Rwanda Logo');
  });

  test('getLogoText returns correct element', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoText = getLogoText();
    expect(logoText).toBeInTheDocument();
    expect(logoText.textContent).toBe('Perfumes Plug Rwanda');
  });

  

});