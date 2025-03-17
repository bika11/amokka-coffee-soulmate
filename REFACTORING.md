
# Code Refactoring Documentation

## Overview
This document outlines the ongoing refactoring efforts for the Amokka Coffee codebase, which aims to improve maintainability, reduce code duplication, and ensure consistent patterns across the application.

## Shared Library Structure
We've created a shared core library to unify code that was previously duplicated between frontend and backend:

```
src/shared/
├── ai/
│   ├── context-builder.ts        # Unified context building for AI models
│   ├── prompt-manager.ts         # Unified prompt management system
│   ├── base-client.ts            # Base AI client implementation (to be migrated)
│   └── types.ts                  # Shared type definitions for AI functionality
│
├── coffee/
│   ├── models.ts                 # Unified coffee data models
│   └── recommendation-utils.ts   # Recommendation algorithm utilities
│
└── utils/
    ├── rate-limiter.ts           # Rate limiting functionality
    └── validation.ts             # Common validation functions
```

## Component Consolidation
As part of the refactoring, we've consolidated related components:
- Merged `MatchScore.tsx` and `RecommendationScore.tsx` into a unified component with configurable display options

## Next Steps
- Update all existing code to use the shared library
- Create environment-specific adapters for browser/server contexts
- Standardize error handling patterns
- Improve performance through memoization and context optimization

## Code Migration Strategy
1. Create shared libraries first (completed)
2. Update imports in existing code (in progress)
3. Gradually replace duplicated code with imports from shared libraries
4. Add tests to ensure behavior is preserved
5. Remove deprecated code paths once all functionality is migrated

For questions about this refactoring, contact the maintainers.
