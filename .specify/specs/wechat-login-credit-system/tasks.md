# Tasks: WeChat Login and Credit System

**Input**: Design documents from `.specify/specs/wechat-login-credit-system/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: Next.js 14+ App Router, TypeScript 5+, Supabase, Tailwind CSS, Shadcn UI
2. Load design documents:
   → data-model.md: 4 entities (User, UserCredits, CreditTransaction, PaymentOrder) → model tasks
   → contracts/: 2 contract files → contract test tasks
   → research.md: WeChat OAuth, Supabase RLS, JWT management → setup tasks
   → quickstart.md: 8 user scenarios → integration test tasks
3. Generate tasks by category:
   → Setup: Supabase, dependencies, linting
   → Tests: contract tests, integration tests, E2E tests
   → Core: database models, auth system, credit system
   → Integration: API endpoints, UI components, middleware
   → Polish: testing, performance, accessibility
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: Next.js App Router structure
- **Database**: Supabase with Row Level Security
- **Testing**: Jest, React Testing Library, Playwright
- **UI**: Tailwind CSS + Shadcn UI components

## Phase 3.1: Setup
- [x] T001 Create Supabase project and configure authentication
- [x] T002 [P] Install and configure required dependencies (Next.js, Supabase, Tailwind CSS, Shadcn UI)
- [x] T003 [P] Setup TypeScript strict mode configuration
- [x] T004 [P] Configure ESLint + Prettier with pre-commit hooks
- [x] T005 [P] Setup testing framework (Jest, React Testing Library, Playwright)
- [x] T006 [P] Configure internationalization (next-intl) for multi-language support
- [x] T007 [P] Setup Tailwind CSS and Shadcn UI component library

## Phase 3.2: Database Setup
- [x] T008 Create Supabase database schema (users, user_credits, credit_transactions tables)
- [x] T009 Setup Row Level Security policies for all tables
- [x] T010 Create database functions for atomic credit operations
- [x] T011 Setup database indexes for performance optimization
- [x] T012 Create database validation functions and constraints

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T013 [P] Contract tests for authentication endpoints in tests/contract/auth.test.ts
- [x] T014 [P] Contract tests for credit management endpoints in tests/contract/credits.test.ts
- [x] T015 [P] Unit tests for database models in tests/unit/models/
- [x] T016 [P] Unit tests for authentication utilities in tests/unit/auth/
- [x] T017 [P] Unit tests for credit management utilities in tests/unit/credits/
- [x] T018 [P] Component tests for authentication components in tests/components/auth/
- [x] T019 [P] Component tests for credit management components in tests/components/credits/
- [x] T020 [P] Integration tests for API endpoints in tests/integration/
- [x] T021 [P] E2E tests for user authentication flow in tests/e2e/auth.spec.ts
- [x] T022 [P] E2E tests for credit management flow in tests/e2e/credits.spec.ts

## Phase 3.4: Core Implementation (ONLY after tests are failing)
- [x] T023 [P] TypeScript interfaces and types in src/types/auth.ts, src/types/credits.ts
- [x] T024 [P] Supabase client configuration in src/lib/supabase/client.ts, server.ts
- [x] T025 [P] Database models and types in src/lib/database/models.ts
- [x] T026 [P] Authentication utilities in src/lib/auth/wechat.ts, session.ts
- [x] T027 [P] Credit management utilities in src/lib/credits/balance.ts, transactions.ts
- [x] T028 [P] Input validation schemas with Zod in src/lib/validation/auth.ts, credits.ts
- [x] T029 [P] Error handling and logging utilities in src/lib/utils/error.ts, logger.ts

## Phase 3.5: API Implementation
- [x] T030 [P] WeChat OAuth QR code generation endpoint in src/app/api/auth/wechat/qr/route.ts
- [x] T031 [P] WeChat OAuth callback handler in src/app/api/auth/wechat/callback/route.ts
- [x] T032 [P] WeChat login status polling endpoint in src/app/api/auth/wechat/status/route.ts
- [x] T033 [P] User profile and credit balance endpoint in src/app/api/user/profile/route.ts
- [x] T034 [P] Credit deduction endpoint in src/app/api/credits/deduct/route.ts
- [x] T035 [P] Credit transaction history endpoint in src/app/api/credits/history/route.ts
- [x] T036 Authentication middleware for protected routes in src/middleware.ts

## Phase 3.6: UI Components
- [x] T037 [P] WeChat login modal component in src/components/auth/WeChatLoginModal.tsx
- [x] T038 [P] User profile display component in src/components/auth/UserProfile.tsx
- [x] T039 [P] Credit balance display component in src/components/credits/CreditBalance.tsx
- [x] T040 [P] Low credit warning component in src/components/credits/LowCreditWarning.tsx
- [x] T041 [P] Transaction history component in src/components/credits/TransactionHistory.tsx
- [x] T042 [P] Credit deduction confirmation component in src/components/credits/CreditDeductionModal.tsx
- [x] T043 [P] Loading states and error handling components in src/components/ui/

## Phase 3.7: Pages and Routing
- [x] T044 [P] Login page in src/app/[locale]/auth/login/page.tsx
- [x] T045 [P] User profile page in src/app/[locale]/profile/page.tsx
- [x] T046 [P] Credit management page in src/app/[locale]/credits/page.tsx
- [x] T047 [P] Transaction history page in src/app/[locale]/credits/history/page.tsx
- [x] T048 [P] Protected route wrapper component in src/components/auth/ProtectedRoute.tsx
- [x] T049 [P] Navigation header with credit balance in src/components/Header.tsx

## Phase 3.8: Integration
- [x] T050 [P] WeChat OAuth integration with QR code generation
- [x] T051 [P] Supabase authentication integration with session management
- [x] T052 [P] Credit system integration with content generation tools
- [x] T053 [P] Real-time credit balance updates
- [x] T054 [P] Responsive design implementation across all components
- [x] T055 [P] Internationalization implementation for all user-facing text
- [x] T056 [P] Performance optimization (Core Web Vitals, bundle size)
- [x] T057 [P] Security implementation (XSS, CSRF protection, input validation)

## Phase 3.9: Polish
- [x] T058 [P] Final unit test coverage verification (target: >90%)
- [x] T059 [P] E2E test execution and validation of all user scenarios
- [x] T060 [P] Performance testing (Core Web Vitals, API response times <500ms)
- [x] T061 [P] Accessibility testing and compliance (WCAG 2.1 AA)
- [x] T062 [P] Cross-browser compatibility testing
- [x] T063 [P] Mobile device testing and responsive design validation
- [x] T064 [P] Security testing (authentication, authorization, data protection)
- [x] T065 [P] Code review and refactoring for maintainability
- [x] T066 [P] Documentation updates and API documentation

## Dependencies
- Database setup (T008-T012) before core implementation (T023-T029)
- Tests (T013-T022) before implementation (T023-T029)
- Core implementation (T023-T029) before API implementation (T030-T036)
- API implementation (T030-T036) before UI components (T037-T043)
- UI components (T037-T043) before pages (T044-T049)
- Pages (T044-T049) before integration (T050-T057)
- Integration (T050-T057) before polish (T058-T066)

## Parallel Execution Examples

### Phase 3.2: Database Setup (Sequential)
```
T008 → T009 → T010 → T011 → T012
(Each task depends on the previous database setup)
```

### Phase 3.3: Tests First (Parallel)
```
# Launch T013-T022 together (All tests can run in parallel):
Task: "Contract tests for authentication endpoints in tests/contract/auth.test.ts"
Task: "Contract tests for credit management endpoints in tests/contract/credits.test.ts"
Task: "Unit tests for database models in tests/unit/models/"
Task: "Unit tests for authentication utilities in tests/unit/auth/"
Task: "Unit tests for credit management utilities in tests/unit/credits/"
Task: "Component tests for authentication components in tests/components/auth/"
Task: "Component tests for credit management components in tests/components/credits/"
Task: "Integration tests for API endpoints in tests/integration/"
Task: "E2E tests for user authentication flow in tests/e2e/auth.spec.ts"
Task: "E2E tests for credit management flow in tests/e2e/credits.spec.ts"
```

### Phase 3.4: Core Implementation (Parallel)
```
# Launch T023-T029 together (Core implementation):
Task: "TypeScript interfaces and types in src/types/auth.ts, src/types/credits.ts"
Task: "Supabase client configuration in src/lib/supabase/client.ts, server.ts"
Task: "Database models and types in src/lib/database/models.ts"
Task: "Authentication utilities in src/lib/auth/wechat.ts, session.ts"
Task: "Credit management utilities in src/lib/credits/balance.ts, transactions.ts"
Task: "Input validation schemas with Zod in src/lib/validation/auth.ts, credits.ts"
Task: "Error handling and logging utilities in src/lib/utils/error.ts, logger.ts"
```

### Phase 3.5: API Implementation (Parallel)
```
# Launch T030-T035 together (API endpoints):
Task: "WeChat OAuth QR code generation endpoint in src/app/api/auth/wechat/qr/route.ts"
Task: "WeChat OAuth callback handler in src/app/api/auth/wechat/callback/route.ts"
Task: "WeChat login status polling endpoint in src/app/api/auth/wechat/status/route.ts"
Task: "User profile and credit balance endpoint in src/app/api/user/profile/route.ts"
Task: "Credit deduction endpoint in src/app/api/credits/deduct/route.ts"
Task: "Credit transaction history endpoint in src/app/api/credits/history/route.ts"
```

### Phase 3.6: UI Components (Parallel)
```
# Launch T037-T043 together (UI components):
Task: "WeChat login modal component in src/components/auth/WeChatLoginModal.tsx"
Task: "User profile display component in src/components/auth/UserProfile.tsx"
Task: "Credit balance display component in src/components/credits/CreditBalance.tsx"
Task: "Low credit warning component in src/components/credits/LowCreditWarning.tsx"
Task: "Transaction history component in src/components/credits/TransactionHistory.tsx"
Task: "Credit deduction confirmation component in src/components/credits/CreditDeductionModal.tsx"
Task: "Loading states and error handling components in src/components/ui/"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- All code MUST use TypeScript strict mode
- All components MUST be responsive and mobile-first
- All user-facing text MUST be externalized for i18n
- Performance targets MUST be met (Core Web Vitals, API response times <500ms)
- Bundle size MUST be under 120KB
- Page load times MUST be under 1.5s

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - auth.test.ts → T013 contract test task [P]
   - credits.test.ts → T014 contract test task [P]
   
2. **From Data Model**:
   - User entity → T015 model creation task [P]
   - UserCredits entity → T015 model creation task [P]
   - CreditTransaction entity → T015 model creation task [P]
   - PaymentOrder entity → T015 model creation task [P] (Note: PaymentOrder excluded from implementation per user request)
   
3. **From User Stories**:
   - 8 quickstart scenarios → T021-T022 integration tests [P]
   - Authentication flow → T021 E2E test
   - Credit management flow → T022 E2E test

4. **Ordering**:
   - Setup → Database → Tests → Core → API → UI → Pages → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T013-T014)
- [x] All entities have model tasks (T015)
- [x] All tests come before implementation (T013-T022 before T023-T029)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] WeChat Pay integration excluded per user request
- [x] PaymentOrder entity excluded from implementation
- [x] All tasks follow TDD approach
- [x] All tasks include TypeScript strict mode requirements
- [x] All tasks include accessibility and performance requirements

## Excluded Features (Per User Request)
- WeChat Pay integration for credit recharge
- PaymentOrder entity implementation
- Payment processing endpoints
- Recharge interface components
- Payment callback handling

## Success Criteria
- All 66 tasks completed successfully
- All tests passing with >90% coverage
- Performance targets met (Core Web Vitals, API response times)
- Accessibility compliance (WCAG 2.1 AA)
- Security requirements satisfied
- Mobile responsive design validated
- Multi-language support implemented
- TypeScript strict mode enforced
