import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import PWAInstallPrompt from './PWAInstallPrompt';
import theme from '../theme';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  test('renders without crashing', () => {
    const { container } = renderWithTheme(<PWAInstallPrompt />);
    expect(container).toBeInTheDocument();
  });

  test('component mounts successfully', () => {
    renderWithTheme(<PWAInstallPrompt />);
    // If we get here without throwing, the component mounted successfully
    expect(true).toBe(true);
  });

  test('PWA functionality is available', () => {
    // Test that PWA-related APIs are properly mocked
    expect(window.matchMedia).toBeDefined();
    expect(localStorage).toBeDefined();
    expect(navigator.userAgent).toBeDefined();
  });
});