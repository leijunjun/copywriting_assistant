# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Next.js project with TypeScript strict mode
- [ ] T003 [P] Configure ESLint + Prettier (or Biome) with pre-commit hooks
- [ ] T004 [P] Setup testing framework (Jest, React Testing Library, Playwright)
- [ ] T005 [P] Configure internationalization (next-intl)
- [ ] T006 [P] Setup Tailwind CSS and Shadcn UI

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T007 [P] Unit tests for utility functions in tests/unit/
- [ ] T008 [P] Component tests for UI components in tests/components/
- [ ] T009 [P] Integration tests for API endpoints in tests/integration/
- [ ] T010 [P] E2E tests for critical user flows in tests/e2e/
- [ ] T011 [P] Contract tests for API contracts in tests/contract/

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T012 [P] TypeScript interfaces and types in src/types/
- [ ] T013 [P] React components with proper TypeScript types in src/components/
- [ ] T014 [P] API routes with TypeScript strict mode in src/app/api/
- [ ] T015 [P] Utility functions with full type safety in src/lib/
- [ ] T016 [P] State management with Redux Toolkit in src/store/
- [ ] T017 [P] Internationalization implementation in src/locales/
- [ ] T018 Input validation with Zod schemas
- [ ] T019 Error handling and logging

## Phase 3.4: Integration
- [ ] T020 [P] Responsive design implementation across all components
- [ ] T021 [P] Performance optimization (Core Web Vitals)
- [ ] T022 [P] Security implementation (XSS, CSRF protection)
- [ ] T023 [P] API integration with proper error handling
- [ ] T024 [P] Image optimization and lazy loading
- [ ] T025 [P] Bundle size optimization

## Phase 3.5: Polish
- [ ] T026 [P] Final unit test coverage verification
- [ ] T027 [P] E2E test execution and validation
- [ ] T028 [P] Performance testing (Core Web Vitals, API response times)
- [ ] T029 [P] Accessibility testing and compliance
- [ ] T030 [P] Cross-browser compatibility testing
- [ ] T031 [P] Mobile device testing
- [ ] T032 [P] Code review and refactoring
- [ ] T033 [P] Documentation updates

## Dependencies
- Tests (T007-T011) before implementation (T012-T019)
- T012 (TypeScript types) blocks T013-T016
- T013 (Components) blocks T020 (Responsive design)
- T014 (API routes) blocks T023 (API integration)
- T015 (Utils) blocks T013-T016
- T016 (State management) blocks T013 (Components)
- T017 (i18n) blocks T013 (Components)
- Implementation before integration (T020-T025)
- Integration before polish (T026-T033)

## Parallel Example
```
# Launch T007-T011 together (Tests First):
Task: "Unit tests for utility functions in tests/unit/"
Task: "Component tests for UI components in tests/components/"
Task: "Integration tests for API endpoints in tests/integration/"
Task: "E2E tests for critical user flows in tests/e2e/"
Task: "Contract tests for API contracts in tests/contract/"

# Launch T012-T017 together (Core Implementation):
Task: "TypeScript interfaces and types in src/types/"
Task: "React components with proper TypeScript types in src/components/"
Task: "API routes with TypeScript strict mode in src/app/api/"
Task: "Utility functions with full type safety in src/lib/"
Task: "State management with Redux Toolkit in src/store/"
Task: "Internationalization implementation in src/locales/"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- All code MUST use TypeScript strict mode
- All components MUST be responsive and mobile-first
- All user-facing text MUST be externalized for i18n
- Performance targets MUST be met (Core Web Vitals, API response times)

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task