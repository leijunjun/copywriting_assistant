/**
 * E2E Tests for User Authentication Flow
 * 
 * These tests verify the complete user authentication flow using Playwright.
 */

import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test.describe('WeChat Login Flow', () => {
    test('should display login button on home page', async ({ page }) => {
      // Check if login button is visible
      const loginButton = page.locator('[data-testid="login-button"]');
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toHaveText('Login with WeChat');
    });

    test('should open WeChat login modal when login button is clicked', async ({ page }) => {
      // Click login button
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if modal is opened
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).toBeVisible();

      // Check if QR code is displayed
      const qrCode = page.locator('[data-testid="qr-code"]');
      await expect(qrCode).toBeVisible();
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Close modal
      const closeButton = page.locator('[data-testid="close-button"]');
      await closeButton.click();

      // Check if modal is closed
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).not.toBeVisible();
    });

    test('should show loading state while generating QR code', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if loading state is shown
      const loading = page.locator('[data-testid="loading"]');
      await expect(loading).toBeVisible();
      await expect(loading).toHaveText('Generating QR code...');
    });

    test('should display QR code after loading', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Wait for QR code to appear
      const qrCode = page.locator('[data-testid="qr-code"]');
      await expect(qrCode).toBeVisible({ timeout: 10000 });
    });

    test('should handle QR code generation error', async ({ page }) => {
      // Mock API error
      await page.route('/api/auth/wechat/qr', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Failed to generate QR code' })
        });
      });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Failed to generate QR code');
    });

    test('should allow retry when QR code generation fails', async ({ page }) => {
      // Mock API error
      await page.route('/api/auth/wechat/qr', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Failed to generate QR code' })
        });
      });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Click retry button
      const retryButton = page.locator('[data-testid="retry-button"]');
      await retryButton.click();

      // Check if retry was attempted
      await expect(retryButton).toBeVisible();
    });
  });

  test.describe('Login Status Polling', () => {
    test('should poll login status while waiting for user', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Mock polling response
      await page.route('/api/auth/wechat/status', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, status: 'pending' })
        });
      });

      // Wait for polling to start
      await page.waitForTimeout(1000);

      // Check if polling is working
      const statusIndicator = page.locator('[data-testid="status-indicator"]');
      await expect(statusIndicator).toBeVisible();
    });

    test('should handle successful login', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Mock successful login response
      await page.route('/api/auth/wechat/status', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 'completed',
            user: {
              id: 'user-123',
              wechat_openid: 'openid-123',
              nickname: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            }
          })
        });
      });

      // Wait for login completion
      await page.waitForTimeout(2000);

      // Check if user is logged in
      const userProfile = page.locator('[data-testid="user-profile"]');
      await expect(userProfile).toBeVisible();
      await expect(userProfile).toHaveText('Test User');
    });

    test('should handle login failure', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Mock login failure response
      await page.route('/api/auth/wechat/status', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Login failed'
          })
        });
      });

      // Wait for failure response
      await page.waitForTimeout(2000);

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Login failed');
    });

    test('should handle session expiration', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Mock session expiration response
      await page.route('/api/auth/wechat/status', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Session expired'
          })
        });
      });

      // Wait for expiration response
      await page.waitForTimeout(2000);

      // Check if session expired message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Session expired');
    });
  });

  test.describe('User Session Management', () => {
    test('should maintain user session after login', async ({ page }) => {
      // Mock successful login
      await page.route('/api/auth/wechat/status', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 'completed',
            user: {
              id: 'user-123',
              wechat_openid: 'openid-123',
              nickname: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            }
          })
        });
      });

      // Open modal and login
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();
      await page.waitForTimeout(2000);

      // Refresh page
      await page.reload();

      // Check if user is still logged in
      const userProfile = page.locator('[data-testid="user-profile"]');
      await expect(userProfile).toBeVisible();
    });

    test('should handle session refresh', async ({ page }) => {
      // Mock session refresh
      await page.route('/api/auth/refresh', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_at: Date.now() + 3600000
          })
        });
      });

      // Trigger session refresh
      await page.evaluate(() => {
        // Simulate token expiration
        localStorage.setItem('token_expires_at', (Date.now() - 1000).toString());
      });

      // Wait for refresh
      await page.waitForTimeout(1000);

      // Check if new token is stored
      const newToken = await page.evaluate(() => {
        return localStorage.getItem('access_token');
      });
      expect(newToken).toBe('new-access-token');
    });

    test('should handle logout', async ({ page }) => {
      // Mock logout
      await page.route('/api/auth/logout', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      // Click logout button
      const logoutButton = page.locator('[data-testid="logout-button"]');
      await logoutButton.click();

      // Check if user is logged out
      const loginButton = page.locator('[data-testid="login-button"]');
      await expect(loginButton).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during login', async ({ page }) => {
      // Mock network error
      await page.route('/api/auth/wechat/qr', route => {
        route.abort('Failed');
      });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if error is handled gracefully
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should handle server errors during login', async ({ page }) => {
      // Mock server error
      await page.route('/api/auth/wechat/qr', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if error is handled gracefully
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should handle timeout during login', async ({ page }) => {
      // Mock timeout
      await page.route('/api/auth/wechat/qr', route => {
        route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Request timeout' })
        });
      });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if timeout is handled gracefully
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navigate to login button using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Check if modal is opened
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).toBeVisible();

      // Navigate within modal using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Check if modal is closed
      await expect(modal).not.toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check ARIA labels
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('should support screen readers', async ({ page }) => {
      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if modal is announced to screen readers
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).toHaveAttribute('aria-label', 'WeChat Login Modal');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check if modal is responsive
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).toBeVisible();

      // Check if QR code is visible on mobile
      const qrCode = page.locator('[data-testid="qr-code"]');
      await expect(qrCode).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open modal
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Test touch interactions
      const closeButton = page.locator('[data-testid="close-button"]');
      await closeButton.tap();

      // Check if modal is closed
      const modal = page.locator('[data-testid="wechat-login-modal"]');
      await expect(modal).not.toBeVisible();
    });
  });
});
