<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: N/A (initial creation)
Added sections: TypeScript Strict Mode, Multi-language Support, Code Quality Standards, Testing Requirements, Performance Standards, Security Requirements, Development Workflow
Removed sections: N/A
Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
Follow-up TODOs: None
-->

# AI Copywriting Assistant Constitution

## Core Principles

### I. TypeScript Strict Mode (NON-NEGOTIABLE)
All code MUST be written in TypeScript with strict mode enabled. No `any` types allowed without explicit justification. Type safety is paramount for maintainability and developer experience. All new features MUST include proper type definitions and interfaces.

### II. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. All new features MUST include unit tests and page-level e2e tests. No code is considered complete without comprehensive test coverage.

### III. Multi-language Support
The application MUST support multiple languages (Chinese, English, Japanese) with proper internationalization. All user-facing text MUST be externalized to translation files. Language switching MUST be seamless and maintain application state.

### IV. Code Quality Standards
ESLint + Prettier (or Biome) rules MUST be enforced. All code MUST pass linting before commit. Pre-commit hooks MUST run lint and typecheck. Code formatting MUST be consistent across the entire codebase. No exceptions for "quick fixes" or "temporary code."

### V. Responsive Design
The application MUST be compatible with PC and mobile devices. All components MUST be responsive and tested across different screen sizes. Mobile-first approach preferred for new UI components.

### VI. Performance Standards
Page load times MUST be under 3 seconds on 3G networks. Core Web Vitals MUST meet Google's recommended thresholds. All API responses MUST be under 500ms for 95th percentile. Image optimization and lazy loading MUST be implemented.

## Technology Stack Requirements

### Frontend Framework
- Next.js 14+ with App Router
- React 18+ with hooks and functional components
- TypeScript 5+ with strict mode
- Tailwind CSS for styling
- Shadcn UI for component library

### Code Quality Tools
- ESLint with Next.js recommended rules
- Prettier for code formatting
- TypeScript compiler for type checking
- Husky for pre-commit hooks
- lint-staged for staged file linting

### Testing Framework
- Jest for unit testing
- React Testing Library for component testing
- Playwright for e2e testing
- MSW for API mocking

### Internationalization
- next-intl for i18n support
- Translation files in JSON format
- Language detection and fallback

## Security Requirements

### Data Protection
- All user inputs MUST be sanitized
- API keys MUST be stored securely
- No sensitive data in client-side code
- HTTPS MUST be enforced in production

### Content Security
- XSS protection MUST be implemented
- CSRF tokens for state-changing operations
- Input validation on both client and server
- Rate limiting for API endpoints

## Development Workflow

### Pre-commit Requirements
- All code MUST pass ESLint checks
- All code MUST pass TypeScript type checking
- All code MUST be formatted with Prettier
- All tests MUST pass
- No console.log statements in production code

### Code Review Process
- All PRs MUST be reviewed by at least one team member
- Constitution compliance MUST be verified
- Test coverage MUST be maintained or improved
- Performance impact MUST be assessed

### Testing Requirements
- Unit tests for all utility functions
- Component tests for all UI components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Visual regression tests for UI changes

## Performance Standards

### Core Web Vitals
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### API Performance
- Response time: < 500ms (95th percentile)
- Error rate: < 1%
- Uptime: > 99.9%

### Bundle Size
- Initial bundle: < 250KB gzipped
- Route chunks: < 100KB gzipped
- Images: WebP format with fallbacks

## Governance

This constitution supersedes all other practices and guidelines. Amendments require:
1. Documentation of the proposed change
2. Approval from the project maintainers
3. Migration plan for existing code
4. Update to dependent templates

All PRs and reviews MUST verify compliance with this constitution. Complexity MUST be justified with clear rationale. Use the project README for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27