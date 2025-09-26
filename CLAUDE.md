# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Lexi Boost" - a comprehensive Vue 3 vocabulary learning web application. It features advanced vocabulary management, spaced repetition review systems, learning analytics, and AI-powered recommendations.

## Commands

- **Development**: `npm run dev` - Start Vite dev server
- **Build (Production)**: `npm run build` - Type check with vue-tsc and build for production
- **Build (Development)**: `npm run build:dev` - Build for production without type checking (faster)
- **Type Check**: `npm run type-check` - Run TypeScript type checking only
- **Preview**: `npm run preview` - Preview production build locally
- **Linting**: `npm run lint` - Run ESLint to check code quality
- **Lint Fix**: `npm run lint:fix` - Run ESLint with auto-fix
- **Formatting**: `npm run format` - Format code with Prettier
- **Format Check**: `npm run format:check` - Check if code is formatted correctly
- **Lint & Format**: `npm run lint:format` - Run linting with fixes and formatting together

## Architecture

**Tech Stack**: Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus + ECharts + Axios + ESLint + Prettier

**Project Structure**:

- `src/api/` - HTTP client and API endpoints (words, reviews, analytics, recommendations)
- `src/store/` - Pinia stores for state management (words, reviews, analytics, recommendations)
- `src/pages/` - Vue page components (Dashboard, Words, Input, Review, Analytics, Recommendations)
- `src/components/` - Reusable Vue components organized by feature
- `src/router/` - Vue Router configuration with navigation guards and nested routes
- `src/types/` - TypeScript type definitions and interfaces
- `src/utils/` - Utility functions and helpers (Ebbinghaus scheduler, chart utilities)
- `src/services/` - Business logic services (review scheduling)

**Key Features**:

- **Dashboard**: Overview of learning progress and statistics
- **Word Input**: Enhanced word entry with duplication detection
- **Word Library**: Comprehensive word management with CRUD operations
- **Review System**: Spaced repetition with Ebbinghaus forgetting curve algorithm
- **Analytics**: Detailed learning statistics and progress tracking
- **Recommendations**: AI-powered learning suggestions and optimization

**Key Patterns**:

- Uses Composition API with `<script setup>` syntax
- Pinia store pattern with composables (useWordsStore, useReviewsStore, etc.)
- Centralized API client with Axios interceptors for logging and error handling
- Path alias `@` points to `src/` directory
- Environment variable `VITE_API_BASE_URL` for API base URL (defaults to http://localhost:3001)

**Data Models**:

- `Word` interface: Basic word structure (id, word, meaning, pronunciation, difficulty, tags)
- `WordEntry`: Dictionary-level word entries with standard definitions
- `UserWordRecord`: User-specific word records with context and confidence
- `ReviewSchedule`: Spaced repetition scheduling data
- `ReviewSession`: Individual review session results
- `LearningStats`: Comprehensive learning analytics
- See `src/types/index.ts` for complete type definitions

**State Management**:

- **Words Store**: Vocabulary and word records management
- **Reviews Store**: Review scheduling and session management
- **Analytics Store**: Learning statistics and progress tracking
- **Recommendations Store**: AI-powered learning suggestions

**Routing**:

- Default redirect to `/dashboard`
- Main routes:
  - `/dashboard` - Learning overview and quick stats
  - `/input` - Enhanced word input interface
  - `/words` - Word library management
  - `/review` - Spaced repetition review system (with sub-routes)
  - `/analytics` - Learning analytics and reports (with sub-routes)
  - `/recommendations` - AI-powered suggestions
- Dynamic page titles set via route meta and beforeEach guard

## Development Notes

**Type Checking**: The project uses strict TypeScript. For faster development builds, use `npm run build:dev` to skip type checking. Run `npm run type-check` to check types separately.

**UI Library**: Uses Element Plus for comprehensive UI components with Chinese localization support.

**Charts**: Integrated Chart.js with vue-chartjs for learning analytics visualizations.

**API Structure**: RESTful API design with consistent response formats using ApiResponse<T> wrapper.

**Code Quality**:
- ESLint 9.x with flat configuration for JavaScript, TypeScript, and Vue files
- Prettier for consistent code formatting
- Practical Vue linting rules (max 3 attributes per line for single-line elements)
- TypeScript-specific rules with unused variable pattern support
- Integrated formatting and linting commands for streamlined development
