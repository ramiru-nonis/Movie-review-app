# CineVault - Premium Movie Review Application

## 1. Project Overview
CineVault is a premium, full-stack movie review application that offers a cinematic experience for movie enthusiasts. Users can explore trending titles, discover films with advanced filters, manage a personal watchlist, and engage with a community through an instant-feedback UI.

The application integrates with **The Movie Database (TMDB) API** and features a robust backend with secure authentication, automated testing, and a seamless Dark/Light mode.

### Key Features
- **Cinematic UI**: Modern, glassmorphic design with smooth transitions and premium aesthetics.
- **Dark & Light Mode**: Seamless theme switching with persistence.
- **Advanced Discovery**: Filter movies by **Genre**, **Release Year**, and **Rating** on both Home and Search pages.
- **Watchlist Engine**: Save movies to your dedicated watchlist with global state synchronization.
- **Optimistic UI**: Real-time review submissions and deletions for an instantaneous feel.
- **Backend Stability**: Core logic protected by unit tests using Vitest.
- **Accessibility**: WCAG-compliant keyboard navigation and ARIA integration.

### Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, React Query, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, Vitest (Testing), Supertest.
- **Database**: SQLite with Prisma ORM.

## 2. Prerequisites
- **Node.js**: >= 18
- **TMDB API Key**: Obtain from [TMDB Developer Portal](https://developer.themoviedb.org/)

## 3. Getting Started

### Local Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/ramiru-nonis/Movie-review-app.git
   cd Movie-review-app
   ```
2. **Install dependencies**
   ```bash
   # Both client and server
   cd server && npm install
   cd ../client && npm install
   ```
3. **Configure environment variables**
   Create a `.env` file in the `server` folder (refer to `.env.example`).
4. **Database Migration**
   ```bash
   cd server
   npx prisma migrate dev
   ```
5. **Start Servers**
   - **Backend**: `npm run dev` (Port 5000)
   - **Frontend**: `npm run dev` (Port 3008)

## 4. Testing
Run the backend unit tests:
```bash
cd server
npm run test
```

## 5. Architecture Decisions
- **React Query Mutations**: Power the **Optimistic UI**, ensuring the app remains responsive during data mutations.
- **Discovery Engine**: Custom backend logic to leverage TMDB's discovery API for advanced filtering.
- **Theme Management**: Context-based theme provider with CSS variables for a flicker-free switching experience.
- **Accessibility First**: Systemic use of focus-visible styles and semantic HTML.

## 6. Roadmap & Known Limitations
- TMDB API rate limits may apply.
- More complex social features (comments on reviews) are currently in development.
- Multi-language support (i18n) is planned for future releases.
