# Feature Specification: WeChat Login and Credit System

## Overview
Implement a comprehensive user authentication and credit management system using WeChat QR code login (follow official account). Users must be logged in to access tools, with automatic credit deduction for content generation. The system includes credit tracking, low balance warnings, and online recharge functionality.

## User Stories

### Authentication
- **US-001**: As a user, I want to scan a WeChat QR code to log in so that I can access the platform securely
- **US-002**: As a user, I want to follow the official WeChat account during login so that I can receive updates and notifications
- **US-003**: As a user, I want to be automatically logged in on subsequent visits so that I don't need to scan QR codes repeatedly

### Credit Management
- **US-004**: As a user, I want to see my current credit balance so that I know how many content generations I can perform
- **US-005**: As a user, I want credits to be automatically deducted when I generate content so that the process is seamless
- **US-006**: As a user, I want to receive warnings when my credit balance is low so that I can recharge before running out
- **US-007**: As a user, I want to recharge my account online so that I can continue using the platform
- **US-008**: As a user, I want to view my credit transaction history so that I can track my usage

### Access Control
- **US-009**: As a visitor, I want to be redirected to login when trying to access tools so that I understand I need to authenticate first
- **US-010**: As a logged-in user, I want to access all tools without restrictions so that I can use the platform fully

## Acceptance Criteria

### Login Flow
- [ ] User can scan WeChat QR code to initiate login
- [ ] User must follow the official WeChat account to complete login
- [ ] Login state persists across browser sessions
- [ ] Users are redirected to login page when accessing tools without authentication
- [ ] Login process completes within 30 seconds of QR code scan

### Credit System
- [ ] New users receive initial credit balance (e.g., 100 credits)
- [ ] Each content generation deducts a fixed amount of credits (e.g., 5 credits)
- [ ] Credit deduction happens automatically before content generation
- [ ] Users with insufficient credits cannot generate content
- [ ] Credit balance is displayed prominently in the user interface

### Warning System
- [ ] Users receive warning when credit balance drops below 20 credits
- [ ] Warning appears as a notification and in the user interface
- [ ] Users can dismiss warnings but they reappear on next low balance

### Recharge System
- [ ] Users can access recharge page from their profile
- [ ] Multiple recharge options available (e.g., 50, 100, 200, 500 credits)
- [ ] Payment integration with WeChat Pay
- [ ] Credits are added immediately after successful payment
- [ ] Receipt confirmation is provided

### Transaction History
- [ ] All credit transactions are logged with timestamp and description
- [ ] Users can view transaction history in their profile
- [ ] History includes both deductions and recharges
- [ ] History is paginated for performance

## Technical Requirements

### Authentication
- WeChat OAuth 2.0 integration for QR code login
- JWT token management for session persistence
- Secure token storage in httpOnly cookies
- Automatic token refresh mechanism

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wechat_openid VARCHAR(100) UNIQUE NOT NULL,
  wechat_unionid VARCHAR(100),
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  balance INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL, -- positive for recharge, negative for deduction
  transaction_type VARCHAR(20) NOT NULL, -- 'recharge', 'deduction'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- `POST /api/auth/wechat/qr` - Generate WeChat QR code for login
- `POST /api/auth/wechat/callback` - Handle WeChat OAuth callback
- `GET /api/user/profile` - Get user profile and credit balance
- `POST /api/credits/deduct` - Deduct credits for content generation
- `POST /api/credits/recharge` - Process credit recharge
- `GET /api/credits/history` - Get credit transaction history

### Frontend Components
- WeChatLoginModal - QR code display and login status
- CreditBalance - Display current credit balance
- LowCreditWarning - Warning component for low balance
- RechargeModal - Credit recharge interface
- TransactionHistory - Credit transaction list

## Implementation Plan

### Phase 1: Authentication Foundation (Week 1)
1. Set up WeChat OAuth 2.0 configuration
2. Implement QR code generation endpoint
3. Create login modal component
4. Implement JWT token management
5. Add authentication middleware

### Phase 2: Credit System Core (Week 2)
1. Design and implement database schema
2. Create credit management API endpoints
3. Implement automatic credit deduction
4. Add credit balance display components
5. Create transaction logging system

### Phase 3: User Experience (Week 3)
1. Implement low credit warning system
2. Create recharge interface
3. Integrate WeChat Pay for payments
4. Build transaction history view
5. Add access control to all tools

### Phase 4: Testing and Polish (Week 4)
1. Comprehensive testing of login flow
2. Test credit deduction scenarios
3. Payment integration testing
4. Performance optimization
5. User acceptance testing

## Testing Strategy

### Unit Tests
- WeChat OAuth integration
- Credit calculation logic
- Transaction logging
- Authentication middleware

### Integration Tests
- Complete login flow
- Credit deduction during content generation
- Payment processing
- Database operations

### End-to-End Tests
- User journey from login to content generation
- Credit recharge process
- Low balance warning flow
- Transaction history viewing

### Security Tests
- JWT token security
- Payment data protection
- SQL injection prevention
- XSS protection

## Dependencies

### External Services
- WeChat Official Account API
- WeChat Pay API
- JWT library for token management
- Database (PostgreSQL/MySQL)

### Internal Dependencies
- Existing content generation API
- User interface components
- Payment processing system
- Database connection

## Risks and Mitigations

### Technical Risks
- **WeChat API rate limiting**: Implement proper caching and request queuing
- **Payment processing failures**: Add retry mechanisms and user notifications
- **Database performance**: Implement proper indexing and query optimization

### Business Risks
- **User adoption**: Provide clear onboarding and initial credit bonus
- **Payment disputes**: Implement comprehensive transaction logging
- **Credit fraud**: Add transaction validation and monitoring

### Security Risks
- **Token hijacking**: Use secure cookie settings and HTTPS
- **Payment data exposure**: Implement PCI compliance measures
- **User data privacy**: Follow WeChat data protection guidelines

## Success Metrics

### Authentication Metrics
- Login success rate > 95%
- Average login time < 30 seconds
- User retention after first login > 80%

### Credit System Metrics
- Credit deduction accuracy > 99.9%
- Payment success rate > 98%
- User satisfaction with recharge process > 4.5/5

### Business Metrics
- User engagement increase > 30%
- Revenue from credit recharges
- Reduced support tickets related to access issues

### Technical Metrics
- API response time < 200ms
- System uptime > 99.9%
- Zero critical security incidents
