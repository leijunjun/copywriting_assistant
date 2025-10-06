# Quickstart Guide: WeChat Login and Credit System

## Overview
This guide demonstrates the complete user journey for the WeChat login and credit system, from initial authentication to credit management and content generation.

## Prerequisites
- WeChat Official Account with OAuth permissions
- WeChat Pay merchant account
- Supabase project with authentication enabled
- Next.js application with the required dependencies

## User Journey Test Scenarios

### Scenario 1: New User Registration and Login

**Objective**: Verify that a new user can register and log in using WeChat QR code

**Steps**:
1. **Navigate to Login Page**
   - Visit `/auth/login`
   - Verify QR code is displayed
   - Verify "Scan with WeChat" instruction is shown

2. **Scan QR Code with WeChat**
   - Open WeChat app
   - Scan the QR code
   - Follow the official account (if required)
   - Authorize the application

3. **Verify Login Success**
   - Check that user is redirected to dashboard
   - Verify user profile is created in database
   - Verify initial credit balance (100 credits)
   - Verify session is established

**Expected Results**:
- User is successfully logged in
- User profile is created with WeChat information
- Initial credit balance is 100 credits
- Session persists across browser refreshes

### Scenario 2: Credit Balance Display

**Objective**: Verify that users can view their current credit balance

**Steps**:
1. **Access User Profile**
   - Navigate to `/profile`
   - Verify credit balance is displayed prominently
   - Verify balance shows correct amount

2. **Check Credit Display in Header**
   - Verify credit balance is shown in navigation header
   - Verify balance updates in real-time

**Expected Results**:
- Credit balance is clearly visible
- Balance is accurate and up-to-date
- Display is responsive on mobile devices

### Scenario 3: Content Generation with Credit Deduction

**Objective**: Verify that credits are automatically deducted when generating content

**Steps**:
1. **Generate Content**
   - Navigate to any content generation tool
   - Enter required parameters
   - Submit the generation request

2. **Verify Credit Deduction**
   - Check that credits are deducted (5 credits per generation)
   - Verify new balance is displayed
   - Check transaction is logged in history

3. **Verify Content Generation**
   - Confirm content is generated successfully
   - Verify content quality meets expectations

**Expected Results**:
- Credits are deducted automatically
- Content is generated successfully
- Transaction is recorded in history
- Balance updates immediately

### Scenario 4: Low Credit Warning

**Objective**: Verify that users receive warnings when credit balance is low

**Steps**:
1. **Deplete Credits**
   - Generate content multiple times to reduce balance
   - Continue until balance drops below 20 credits

2. **Verify Warning Display**
   - Check that low credit warning appears
   - Verify warning is dismissible
   - Verify warning reappears on next low balance

3. **Test Warning Persistence**
   - Dismiss the warning
   - Generate more content
   - Verify warning reappears

**Expected Results**:
- Warning appears when balance < 20 credits
- Warning is user-friendly and actionable
- Warning persists until balance is restored

### Scenario 5: Credit Recharge Process

**Objective**: Verify that users can recharge their credits using WeChat Pay

**Steps**:
1. **Access Recharge Page**
   - Navigate to `/credits/recharge`
   - Verify recharge options are displayed
   - Select a recharge amount (e.g., 100 credits)

2. **Initiate Payment**
   - Click "Recharge" button
   - Verify WeChat Pay interface opens
   - Complete payment in WeChat

3. **Verify Payment Success**
   - Check that payment is processed
   - Verify credits are added to account
   - Verify transaction is recorded
   - Verify success notification is shown

**Expected Results**:
- Payment interface is user-friendly
- Payment is processed successfully
- Credits are added immediately
- Transaction is recorded in history

### Scenario 6: Transaction History

**Objective**: Verify that users can view their credit transaction history

**Steps**:
1. **Access Transaction History**
   - Navigate to `/credits/history`
   - Verify transaction list is displayed
   - Check pagination if many transactions

2. **Verify Transaction Details**
   - Check that all transactions are listed
   - Verify transaction types are correct
   - Verify amounts and descriptions are accurate
   - Verify timestamps are correct

3. **Test Filtering and Pagination**
   - Filter by transaction type
   - Navigate through pages
   - Verify performance with large datasets

**Expected Results**:
- All transactions are displayed correctly
- Filtering and pagination work properly
- Performance is acceptable with large datasets
- Transaction details are accurate

### Scenario 7: Insufficient Credits Handling

**Objective**: Verify that users cannot generate content with insufficient credits

**Steps**:
1. **Deplete All Credits**
   - Generate content until balance reaches 0
   - Verify balance shows 0 credits

2. **Attempt Content Generation**
   - Try to generate content with 0 credits
   - Verify error message is displayed
   - Verify generation is blocked

3. **Verify Recharge Prompt**
   - Check that recharge option is presented
   - Verify user can navigate to recharge page

**Expected Results**:
- Content generation is blocked with insufficient credits
- Clear error message is displayed
- Recharge option is prominently presented

### Scenario 8: Session Management

**Objective**: Verify that user sessions are properly managed

**Steps**:
1. **Login and Establish Session**
   - Complete WeChat login process
   - Verify session is established

2. **Test Session Persistence**
   - Refresh the browser page
   - Close and reopen browser
   - Verify user remains logged in

3. **Test Session Expiration**
   - Wait for session to expire (if configured)
   - Verify user is redirected to login
   - Verify session cleanup

**Expected Results**:
- Sessions persist across browser refreshes
- Sessions expire appropriately
- Users are redirected to login when session expires

## API Testing

### Authentication Endpoints

```bash
# Generate QR code
curl -X POST https://api.copywriting-assistant.com/api/auth/wechat/qr

# Check login status
curl -X GET "https://api.copywriting-assistant.com/api/auth/wechat/status?state=STATE_PARAM"

# Handle callback
curl -X POST https://api.copywriting-assistant.com/api/auth/wechat/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "AUTH_CODE", "state": "STATE_PARAM"}'
```

### Credit Management Endpoints

```bash
# Get user profile and credits
curl -X GET https://api.copywriting-assistant.com/api/user/profile \
  -H "Authorization: Bearer JWT_TOKEN"

# Deduct credits
curl -X POST https://api.copywriting-assistant.com/api/credits/deduct \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "description": "Content generation"}'

# Create recharge order
curl -X POST https://api.copywriting-assistant.com/api/credits/recharge \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"credits": 100, "payment_method": "wechat_pay"}'

# Get transaction history
curl -X GET "https://api.copywriting-assistant.com/api/credits/history?page=1&limit=20" \
  -H "Authorization: Bearer JWT_TOKEN"
```

## Performance Testing

### Load Testing Scenarios

1. **Concurrent Login Requests**
   - Test 100 concurrent QR code generations
   - Verify response times < 500ms
   - Verify no rate limiting issues

2. **Credit Deduction Under Load**
   - Test 50 concurrent credit deductions
   - Verify atomic operations
   - Verify no race conditions

3. **Transaction History Queries**
   - Test pagination with 10,000 transactions
   - Verify response times < 200ms
   - Verify memory usage is reasonable

### Database Performance

1. **Index Performance**
   - Verify user lookup by WeChat OpenID < 10ms
   - Verify credit balance queries < 5ms
   - Verify transaction history queries < 50ms

2. **Concurrent Operations**
   - Test concurrent credit operations
   - Verify no deadlocks
   - Verify data consistency

## Security Testing

### Authentication Security

1. **JWT Token Security**
   - Verify tokens are properly signed
   - Verify token expiration
   - Verify token refresh mechanism

2. **Session Security**
   - Verify httpOnly cookies
   - Verify secure cookie settings
   - Verify CSRF protection

### Data Security

1. **Row Level Security**
   - Verify users can only access their own data
   - Verify admin operations are properly secured
   - Verify payment data is protected

2. **Input Validation**
   - Test with malicious input
   - Verify SQL injection prevention
   - Verify XSS protection

## Error Handling Testing

### Network Errors

1. **WeChat API Failures**
   - Test with WeChat API down
   - Verify graceful error handling
   - Verify user-friendly error messages

2. **Payment Failures**
   - Test with WeChat Pay failures
   - Verify transaction rollback
   - Verify user notification

### Database Errors

1. **Connection Failures**
   - Test with database unavailable
   - Verify connection retry logic
   - Verify graceful degradation

2. **Transaction Failures**
   - Test with insufficient credits
   - Verify atomic rollback
   - Verify error logging

## Mobile Testing

### Responsive Design

1. **Mobile Login Flow**
   - Test QR code scanning on mobile
   - Verify responsive design
   - Verify touch interactions

2. **Mobile Payment**
   - Test WeChat Pay on mobile
   - Verify payment flow
   - Verify success handling

### Performance on Mobile

1. **Bundle Size**
   - Verify initial bundle < 120KB
   - Verify lazy loading works
   - Verify image optimization

2. **Load Times**
   - Test on 3G networks
   - Verify load times < 1.5s
   - Verify Core Web Vitals

## Accessibility Testing

### Screen Reader Support

1. **Navigation**
   - Test with screen reader
   - Verify proper ARIA labels
   - Verify keyboard navigation

2. **Forms**
   - Test form accessibility
   - Verify error message announcements
   - Verify field descriptions

### Keyboard Navigation

1. **Tab Order**
   - Verify logical tab order
   - Verify focus indicators
   - Verify keyboard shortcuts

2. **Modal Dialogs**
   - Test QR code modal accessibility
   - Verify payment modal accessibility
   - Verify focus management

## Success Criteria

### Functional Requirements
- [ ] All user stories are testable and pass
- [ ] All API endpoints respond correctly
- [ ] All error scenarios are handled gracefully
- [ ] All security requirements are met

### Performance Requirements
- [ ] Page load times < 1.5s
- [ ] API response times < 500ms
- [ ] Bundle size < 120KB
- [ ] Core Web Vitals meet standards

### Security Requirements
- [ ] All authentication flows are secure
- [ ] All data access is properly controlled
- [ ] All payments are secure
- [ ] All user data is protected

### Accessibility Requirements
- [ ] All components are accessible
- [ ] All forms are accessible
- [ ] All navigation is accessible
- [ ] All content is accessible
