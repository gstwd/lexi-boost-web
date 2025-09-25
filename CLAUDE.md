# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Lexi Boost" - a Vue 3 vocabulary learning web application. It helps users manage and study words with features for CRUD operations on vocabulary.

## Commands

- **Development**: `npm run dev` - Start Vite dev server
- **Build**: `npm run build` - Type check with vue-tsc and build for production
- **Preview**: `npm run preview` - Preview production build locally

## Architecture

**Tech Stack**: Vue 3 + TypeScript + Vite + Pinia + Vue Router + TailwindCSS + Axios

**Project Structure**:
- `src/api/` - HTTP client and API endpoints (words CRUD operations)
- `src/store/` - Pinia stores for state management (words store with pagination)
- `src/pages/` - Vue page components (WordsPage)
- `src/router/` - Vue Router configuration with navigation guards

**Key Patterns**:
- Uses Composition API with `<script setup>` syntax
- Pinia store pattern with composables (useWordsStore)
- Centralized API client with Axios interceptors for logging and error handling
- Path alias `@` points to `src/` directory
- Environment variable `VITE_API_BASE_URL` for API base URL (defaults to http://localhost:3001)

**Data Models**:
- `Word` interface: id, word, meaning, pronunciation, difficulty ('easy'|'medium'|'hard'), tags
- API responses include pagination metadata (page, limit, total)

**State Management**:
- Words store handles all vocabulary operations with loading states, error handling, and pagination
- Store methods: fetchWords, fetchWordById, addWord, updateWord, deleteWord

**Routing**:
- Default redirect to `/words`
- Main route: `/words` (word list)
- Dynamic page titles set via route meta and beforeEach guard