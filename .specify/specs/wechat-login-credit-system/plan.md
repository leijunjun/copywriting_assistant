# Implementation Plan: WeChat Login and Credit System

**Branch**: `feature/wechat-login-credit-system` | **Date**: 2025-01-27 | **Spec**: `.specify/features/wechat-login-credit-system.md`
**Input**: Feature specification from `.specify/features/wechat-login-credit-system.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement a comprehensive user authentication and credit management system using WeChat QR code login. The system includes user registration/login, credit tracking, automatic deduction for content generation, low balance warnings, and online recharge functionality. All user data is stored in Supabase with proper security policies.

## Technical Context
**Language/Version**: TypeScript 5+ with Next.js 14+ App Router  
**Primary Dependencies**: Next.js, React 18+, Supabase, Tailwind CSS, Shadcn UI  
**Storage**: Supabase (PostgreSQL) with Row Level Security  
**Testing**: Jest, React Testing Library, Playwright  
**Target Platform**: Web application (PC and mobile responsive)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: Page load < 1.5s, JS bundle < 120KB, API response < 500ms  
**Constraints**: HTTPS required, input validation (zod), accessibility (a11y), mobile responsive  
**Scale/Scope**: Multi-user platform with credit transactions and payment processing  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### TypeScript Strict Mode Compliance
- [x] All new code uses TypeScript with strict mode
- [x] No `any` types without explicit justification
- [x] Proper type definitions for all interfaces
- [x] Type safety maintained across all components

### Test-First Development Compliance
- [x] Unit tests written before implementation
- [x] E2E tests planned for critical user flows
- [x] Test coverage maintained or improved
- [x] Red-Green-Refactor cycle followed

### Multi-language Support Compliance
- [x] All user-facing text externalized to translation files
- [x] Language switching functionality preserved
- [x] Internationalization requirements met

### Code Quality Standards Compliance
- [x] ESLint + Prettier rules enforced
- [x] Pre-commit hooks configured
- [x] Code formatting consistent
- [x] No console.log in production code

### Responsive Design Compliance
- [x] Mobile-first approach for new components
- [x] Cross-device compatibility maintained
- [x] Responsive design tested

### Performance Standards Compliance
- [x] Core Web Vitals targets met
- [x] API response times under 500ms
- [x] Bundle size within limits
- [x] Image optimization implemented

## Project Structure

### Documentation (this feature)
```
specs/wechat-login-credit-system/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure (frontend + backend)
src/
├── app/
│   ├── [locale]/
│   │   ├── auth/           # Login/register pages
│   │   ├── profile/        # User profile page
│   │   ├── credits/        # Credit management pages
│   │   └── api/            # API routes
│   └── globals.css
├── components/
│   ├── auth/               # Authentication components
│   ├── credits/            # Credit management components
│   └── ui/                 # Shared UI components
├── lib/
│   ├── supabase/           # Supabase client and types
│   ├── auth/               # Authentication utilities
│   └── credits/            # Credit management utilities
└── types/                  # TypeScript type definitions

tests/
├── __mocks__/
├── components/
├── pages/
└── utils/
```

**Structure Decision**: Web application (frontend + backend) - Next.js App Router with Supabase backend

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - WeChat OAuth 2.0 integration patterns
   - Supabase Row Level Security implementation
   - WeChat Pay integration for credit recharge
   - JWT token management with Supabase Auth
   - Credit transaction atomic operations

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research WeChat OAuth 2.0 integration for Next.js"
     Task: "Research Supabase RLS policies for user data isolation"
     Task: "Research WeChat Pay integration patterns"
     Task: "Research JWT token management with Supabase"
     Task: "Research atomic credit transaction patterns"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User entity (WeChat integration)
   - Credit entity (balance management)
   - Transaction entity (credit history)
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - Authentication endpoints
   - Credit management endpoints
   - Payment processing endpoints
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
   - Add new tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Specific Task Categories**:
1. **Database Setup Tasks**:
   - Create Supabase tables (users, user_credits, credit_transactions, payment_orders)
   - Set up Row Level Security policies
   - Create database functions for atomic operations
   - Set up indexes for performance

2. **Authentication Tasks**:
   - Implement WeChat OAuth integration
   - Create JWT token management
   - Build login/logout components
   - Add authentication middleware

3. **Credit System Tasks**:
   - Implement credit balance management
   - Create credit deduction logic
   - Build credit display components
   - Add low balance warning system

4. **Payment Integration Tasks**:
   - Integrate WeChat Pay for recharges
   - Create payment order management
   - Build recharge interface
   - Handle payment callbacks

5. **UI/UX Tasks**:
   - Create responsive login pages
   - Build user profile pages
   - Design credit management interface
   - Add transaction history views

6. **Testing Tasks**:
   - Write unit tests for all components
   - Create integration tests for API endpoints
   - Build E2E tests for user journeys
   - Add performance tests

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Database → Auth → Credits → Payment → UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All requirements align with constitution | No violations detected |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
