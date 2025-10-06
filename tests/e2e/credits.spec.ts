/**
 * E2E Tests for Credit Management Flow
 * 
 * These tests verify the complete credit management flow using Playwright.
 */

import { test, expect } from '@playwright/test';

test.describe('Credit Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page and login before each test
    await page.goto('/');
    
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
  });

  test.describe('Credit Balance Display', () => {
    test('should display current credit balance', async ({ page }) => {
      // Mock credit balance API
      await page.route('/api/user/profile', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'user-123',
              wechat_openid: 'openid-123',
              nickname: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            },
            credits: {
              balance: 100,
              updated_at: new Date().toISOString()
            }
          })
        });
      });

      // Navigate to profile page
      await page.goto('/profile');

      // Check if credit balance is displayed
      const balanceDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(balanceDisplay).toBeVisible();
      await expect(balanceDisplay).toHaveText('100');
    });

    test('should show low balance warning when credits are low', async ({ page }) => {
      // Mock low credit balance
      await page.route('/api/user/profile', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'user-123',
              wechat_openid: 'openid-123',
              nickname: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            },
            credits: {
              balance: 5,
              updated_at: new Date().toISOString()
            }
          })
        });
      });

      // Navigate to profile page
      await page.goto('/profile');

      // Check if low balance warning is displayed
      const warning = page.locator('[data-testid="low-balance-warning"]');
      await expect(warning).toBeVisible();
      await expect(warning).toHaveText('Low balance warning');
    });

    test('should handle credit balance loading state', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/user/profile', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              user: {
                id: 'user-123',
                wechat_openid: 'openid-123',
                nickname: 'Test User',
                avatar_url: 'https://example.com/avatar.jpg'
              },
              credits: {
                balance: 100,
                updated_at: new Date().toISOString()
              }
            })
          });
        }, 1000);
      });

      // Navigate to profile page
      await page.goto('/profile');

      // Check if loading state is shown
      const loading = page.locator('[data-testid="loading"]');
      await expect(loading).toBeVisible();
      await expect(loading).toHaveText('Loading balance...');
    });
  });

  test.describe('Credit Deduction', () => {
    test('should deduct credits when generating content', async ({ page }) => {
      // Mock credit deduction API
      await page.route('/api/credits/deduct', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transaction_id: 'txn-123',
            new_balance: 80,
            message: 'Credits deducted successfully'
          })
        });
      });

      // Navigate to content generation page
      await page.goto('/');

      // Fill in content generation form
      const input = page.locator('[data-testid="content-input"]');
      await input.fill('Generate content about AI');

      // Submit form
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click();

      // Check if credits were deducted
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toHaveText('Credits deducted successfully');
    });

    test('should handle insufficient credits error', async ({ page }) => {
      // Mock insufficient credits error
      await page.route('/api/credits/deduct', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Insufficient credits',
            current_balance: 5,
            required_credits: 10
          })
        });
      });

      // Navigate to content generation page
      await page.goto('/');

      // Fill in content generation form
      const input = page.locator('[data-testid="content-input"]');
      await input.fill('Generate content about AI');

      // Submit form
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click();

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Insufficient credits');
    });

    test('should show recharge prompt when credits are insufficient', async ({ page }) => {
      // Mock insufficient credits error
      await page.route('/api/credits/deduct', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Insufficient credits',
            current_balance: 5,
            required_credits: 10
          })
        });
      });

      // Navigate to content generation page
      await page.goto('/');

      // Fill in content generation form
      const input = page.locator('[data-testid="content-input"]');
      await input.fill('Generate content about AI');

      // Submit form
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click();

      // Check if recharge prompt is shown
      const rechargePrompt = page.locator('[data-testid="recharge-prompt"]');
      await expect(rechargePrompt).toBeVisible();
      await expect(rechargePrompt).toHaveText('Please recharge to continue');
    });
  });

  test.describe('Credit Transaction History', () => {
    test('should display credit transaction history', async ({ page }) => {
      // Mock transaction history API
      await page.route('/api/credits/history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transactions: [
              {
                id: 'txn-1',
                amount: -10,
                transaction_type: 'deduction',
                description: 'Content generation',
                created_at: new Date().toISOString()
              },
              {
                id: 'txn-2',
                amount: 100,
                transaction_type: 'bonus',
                description: 'Welcome bonus',
                created_at: new Date(Date.now() - 86400000).toISOString()
              }
            ]
          })
        });
      });

      // Navigate to credit history page
      await page.goto('/credits/history');

      // Check if transaction history is displayed
      const transactionList = page.locator('[data-testid="transaction-list"]');
      await expect(transactionList).toBeVisible();

      // Check if transactions are listed
      const transactions = page.locator('[data-testid="transaction-item"]');
      await expect(transactions).toHaveCount(2);
    });

    test('should filter transactions by type', async ({ page }) => {
      // Mock transaction history API
      await page.route('/api/credits/history', route => {
        const url = new URL(route.request().url());
        const type = url.searchParams.get('type');
        
        const transactions = type === 'deduction' ? [
          {
            id: 'txn-1',
            amount: -10,
            transaction_type: 'deduction',
            description: 'Content generation',
            created_at: new Date().toISOString()
          }
        ] : [
          {
            id: 'txn-2',
            amount: 100,
            transaction_type: 'bonus',
            description: 'Welcome bonus',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transactions
          })
        });
      });

      // Navigate to credit history page
      await page.goto('/credits/history');

      // Filter by deduction type
      const deductionFilter = page.locator('[data-testid="filter-deduction"]');
      await deductionFilter.click();

      // Check if only deduction transactions are shown
      const transactions = page.locator('[data-testid="transaction-item"]');
      await expect(transactions).toHaveCount(1);
    });

    test('should paginate transaction history', async ({ page }) => {
      // Mock paginated transaction history
      await page.route('/api/credits/history', route => {
        const url = new URL(route.request().url());
        const page = url.searchParams.get('page') || '1';
        const limit = url.searchParams.get('limit') || '10';
        
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        
        const allTransactions = Array.from({ length: 25 }, (_, i) => ({
          id: `txn-${i + 1}`,
          amount: -10,
          transaction_type: 'deduction',
          description: `Content generation ${i + 1}`,
          created_at: new Date(Date.now() - i * 86400000).toISOString()
        }));
        
        const transactions = allTransactions.slice(startIndex, endIndex);
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transactions,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 25,
              total_pages: 3
            }
          })
        });
      });

      // Navigate to credit history page
      await page.goto('/credits/history');

      // Check if first page is loaded
      const transactions = page.locator('[data-testid="transaction-item"]');
      await expect(transactions).toHaveCount(10);

      // Navigate to next page
      const nextButton = page.locator('[data-testid="next-page"]');
      await nextButton.click();

      // Check if second page is loaded
      await expect(transactions).toHaveCount(10);
    });
  });

  test.describe('Credit Recharge', () => {
    test('should display recharge options', async ({ page }) => {
      // Navigate to recharge page
      await page.goto('/credits/recharge');

      // Check if recharge options are displayed
      const rechargeOptions = page.locator('[data-testid="recharge-option"]');
      await expect(rechargeOptions).toHaveCount(3); // 10, 50, 100 credits

      // Check if option prices are displayed
      const option10 = page.locator('[data-testid="recharge-option-10"]');
      await expect(option10).toHaveText('10 Credits');

      const option50 = page.locator('[data-testid="recharge-option-50"]');
      await expect(option50).toHaveText('50 Credits');

      const option100 = page.locator('[data-testid="recharge-option-100"]');
      await expect(option100).toHaveText('100 Credits');
    });

    test('should handle recharge selection', async ({ page }) => {
      // Navigate to recharge page
      await page.goto('/credits/recharge');

      // Select recharge option
      const option50 = page.locator('[data-testid="recharge-option-50"]');
      await option50.click();

      // Check if option is selected
      await expect(option50).toHaveClass('selected');

      // Check if total amount is calculated
      const totalAmount = page.locator('[data-testid="total-amount"]');
      await expect(totalAmount).toHaveText('¥50.00');
    });

    test('should handle recharge confirmation', async ({ page }) => {
      // Navigate to recharge page
      await page.goto('/credits/recharge');

      // Select recharge option
      const option50 = page.locator('[data-testid="recharge-option-50"]');
      await option50.click();

      // Click confirm button
      const confirmButton = page.locator('[data-testid="confirm-recharge"]');
      await confirmButton.click();

      // Check if confirmation dialog is shown
      const confirmationDialog = page.locator('[data-testid="confirmation-dialog"]');
      await expect(confirmationDialog).toBeVisible();
      await expect(confirmationDialog).toHaveText('Confirm recharge of 50 credits for ¥50.00?');
    });

    test('should handle recharge cancellation', async ({ page }) => {
      // Navigate to recharge page
      await page.goto('/credits/recharge');

      // Select recharge option
      const option50 = page.locator('[data-testid="recharge-option-50"]');
      await option50.click();

      // Click confirm button
      const confirmButton = page.locator('[data-testid="confirm-recharge"]');
      await confirmButton.click();

      // Click cancel button
      const cancelButton = page.locator('[data-testid="cancel-recharge"]');
      await cancelButton.click();

      // Check if dialog is closed
      const confirmationDialog = page.locator('[data-testid="confirmation-dialog"]');
      await expect(confirmationDialog).not.toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle credit balance fetch error', async ({ page }) => {
      // Mock credit balance API error
      await page.route('/api/user/profile', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to fetch credit balance'
          })
        });
      });

      // Navigate to profile page
      await page.goto('/profile');

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Failed to fetch credit balance');
    });

    test('should handle credit deduction error', async ({ page }) => {
      // Mock credit deduction API error
      await page.route('/api/credits/deduct', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to deduct credits'
          })
        });
      });

      // Navigate to content generation page
      await page.goto('/');

      // Fill in content generation form
      const input = page.locator('[data-testid="content-input"]');
      await input.fill('Generate content about AI');

      // Submit form
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click();

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Failed to deduct credits');
    });

    test('should handle transaction history fetch error', async ({ page }) => {
      // Mock transaction history API error
      await page.route('/api/credits/history', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to fetch transaction history'
          })
        });
      });

      // Navigate to credit history page
      await page.goto('/credits/history');

      // Check if error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Failed to fetch transaction history');
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation for credit management', async ({ page }) => {
      // Navigate to profile page
      await page.goto('/profile');

      // Navigate to credit balance using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Check if credit balance is focused
      const balanceDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(balanceDisplay).toBeFocused();
    });

    test('should have proper ARIA labels for credit components', async ({ page }) => {
      // Navigate to profile page
      await page.goto('/profile');

      // Check ARIA labels
      const balanceDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(balanceDisplay).toHaveAttribute('aria-label', 'Current credit balance');

      const rechargeButton = page.locator('[data-testid="recharge-button"]');
      await expect(rechargeButton).toHaveAttribute('aria-label', 'Recharge credits');
    });

    test('should announce credit balance changes to screen readers', async ({ page }) => {
      // Navigate to profile page
      await page.goto('/profile');

      // Simulate credit balance change
      await page.evaluate(() => {
        const event = new CustomEvent('creditBalanceChanged', {
          detail: { newBalance: 80, oldBalance: 100 }
        });
        document.dispatchEvent(event);
      });

      // Check if change is announced
      const announcement = page.locator('[data-testid="balance-announcement"]');
      await expect(announcement).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices for credit management', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to profile page
      await page.goto('/profile');

      // Check if credit balance is visible on mobile
      const balanceDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(balanceDisplay).toBeVisible();

      // Check if recharge button is accessible on mobile
      const rechargeButton = page.locator('[data-testid="recharge-button"]');
      await expect(rechargeButton).toBeVisible();
    });

    test('should handle touch interactions for credit management', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to profile page
      await page.goto('/profile');

      // Test touch interactions
      const rechargeButton = page.locator('[data-testid="recharge-button"]');
      await rechargeButton.tap();

      // Check if recharge page is opened
      await expect(page).toHaveURL('/credits/recharge');
    });
  });
});
