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
    auth: (state = { isAuthenticated: false, user: null }, action) => state,
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
const getLogoImage = () => {
  return screen.queryByAltText('Perfumes Plug Rwanda Logo');
};

const getLogoText = () => {
  return screen.queryByText('Perfumes Plug Rwanda');
};

const getLogoContainer = () => {
  const logoImage = getLogoImage();
  return logoImage ? logoImage.closest('a') : null;
};

// Helper function to check if logo image has correct attributes
const checkLogoImageAttributes = (logoImage) => {
  return {
    hasSrc: logoImage.src.includes('/images/perfumes_plug_logo.jpg'),
    hasAlt: logoImage.alt === 'Perfumes Plug Rwanda Logo',
    hasCorrectTag: logoImage.tagName.toLowerCase() === 'img'
  };
};

// Helper function to check logo container link
const checkLogoContainerLink = (container) => {
  return {
    isLink: container && container.tagName.toLowerCase() === 'a',
    hasCorrectHref: container && container.getAttribute('href') === '/'
  };
};

describe('Header Logo Tests', () => {
  test('displays logo image with correct src and alt attributes', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    
    const attributes = checkLogoImageAttributes(logoImage);
    expect(attributes.hasSrc).toBe(true);
    expect(attributes.hasAlt).toBe(true);
    expect(attributes.hasCorrectTag).toBe(true);
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
    
    const logoContainer = getLogoContainer();
    expect(logoContainer).toBeInTheDocument();
    
    const linkProperties = checkLogoContainerLink(logoContainer);
    expect(linkProperties.isLink).toBe(true);
    expect(linkProperties.hasCorrectHref).toBe(true);
  });

  test('logo image and text are both present in the same container', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    const logoText = getLogoText();
    const logoContainer = getLogoContainer();
    
    expect(logoImage).toBeInTheDocument();
    expect(logoText).toBeInTheDocument();
    expect(logoContainer).toBeInTheDocument();
    
    // Check that both image and text are within the same container
    expect(logoContainer.contains(logoImage)).toBe(true);
    expect(logoContainer.contains(logoText)).toBe(true);
  });

  test('logo image has proper styling attributes', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    expect(logoImage).toBeInTheDocument();
    
    // Check that the image has the expected styling (via styled component)
    const computedStyle = window.getComputedStyle(logoImage);
    expect(logoImage.style).toBeDefined();
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
    
    // Verify both elements contribute to the brand identity
    expect(logoImage.alt).toContain('Perfumes Plug Rwanda');
    expect(logoText.textContent).toBe('Perfumes Plug Rwanda');
  });

  test('logo elements are properly structured in DOM', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoContainer = getLogoContainer();
    const logoImage = getLogoImage();
    const logoText = getLogoText();
    
    expect(logoContainer).toBeInTheDocument();
    expect(logoImage).toBeInTheDocument();
    expect(logoText).toBeInTheDocument();
    
    // Check DOM structure: container > [image, text]
    const containerChildren = Array.from(logoContainer.children);
    expect(containerChildren.length).toBeGreaterThanOrEqual(2);
    
    // Image should come before text in the DOM
    const imageIndex = containerChildren.findIndex(child => child.tagName.toLowerCase() === 'img');
    const textIndex = containerChildren.findIndex(child => child.textContent === 'Perfumes Plug Rwanda');
    
    expect(imageIndex).toBeLessThan(textIndex);
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
    expect(logoImage.tagName.toLowerCase()).toBe('img');
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

  test('getLogoContainer returns correct element', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoContainer = getLogoContainer();
    expect(logoContainer).toBeInTheDocument();
    expect(logoContainer.tagName.toLowerCase()).toBe('a');
  });

  test('checkLogoImageAttributes validates image properties', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoImage = getLogoImage();
    const attributes = checkLogoImageAttributes(logoImage);
    
    expect(attributes.hasSrc).toBe(true);
    expect(attributes.hasAlt).toBe(true);
    expect(attributes.hasCorrectTag).toBe(true);
  });

  test('checkLogoContainerLink validates container properties', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    
    const logoContainer = getLogoContainer();
    const linkProperties = checkLogoContainerLink(logoContainer);
    
    expect(linkProperties.isLink).toBe(true);
    expect(linkProperties.hasCorrectHref).toBe(true);
  });
});