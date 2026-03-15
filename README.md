Movie Review Application

A full-stack Movie Review Application built using Next.js, Node.js, and SQLite that integrates with The Movie Database (TMDB) API.
Users can search for movies, view detailed information, and submit their own reviews.

This project was developed as part of a Full Stack Developer / Software Engineer Intern technical assignment.

Tech Stack
Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

React Query (for data fetching and caching)

Backend

Node.js

Express.js

REST API architecture

JWT Authentication

Database

SQLite

Prisma ORM

Prisma Migrations

Other Tools

ESLint

Prettier

bcrypt (password hashing)

Zod (API validation)

Features
Authentication

User registration with email, username, and password

Secure login/logout

JWT based authentication

Protected routes

Password hashing with bcrypt

Movie Search & Discovery

Search movies using TMDB API

Debounced search input

Search results showing:

Movie poster

Title

Release year

Average rating

Pagination / infinite scroll

Trending movies on the home page

Movie Details

Movie poster and backdrop

Title and synopsis

Genres

Runtime

Release date

Cast information

Embedded movie trailer (YouTube)

Average rating calculated from user reviews

Review System

Authenticated users can:

Add a review (rating 1–5 + text)

Edit their existing review

Delete their review

View all reviews with:

Username

Rating

Review text

Timestamp

Only one review per user per movie is allowed.

Watchlist (Optional Feature)

Users can:

Add movies to their watchlist

Remove movies

View saved movies on a watchlist page

Project Structure
movie-review-app/
│
├── client/          # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── server/          # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── prisma/
│
└── README.md

Shared types and API contracts are maintained where possible to ensure consistency between frontend and backend.

Prerequisites

Before running the project locally make sure you have:

Node.js >= 18

npm / pnpm / yarn

TMDB API Key

Create a free API key here:
https://developer.themoviedb.org/

Environment Variables

Create a .env file in the backend directory.

Example:

DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
TMDB_API_KEY="your_tmdb_api_key"
PORT=5000

A .env.example file is included in the repository.

Getting Started

Clone the repository:

git clone https://github.com/your-username/movie-review-app.git
cd movie-review-app

Install dependencies:

npm install

Run database migrations:

npx prisma migrate dev

Seed the database:

npm run seed

Start the backend server:

npm run server

Start the frontend:

npm run client

The application will run at:

Frontend: http://localhost:3000
Backend: http://localhost:5000
API Design

The backend follows RESTful conventions with consistent status codes and error responses.

Example routes:

POST /api/auth/register
POST /api/auth/login

GET /api/movies/search
GET /api/movies/:id

POST /api/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id

GET /api/watchlist
POST /api/watchlist
DELETE /api/watchlist/:movieId

Input validation is implemented using Zod middleware.

Database Schema (Simplified)

Users

id

email

username

password

createdAt

Reviews

id

rating

reviewText

userId

movieId

createdAt

Watchlist

id

userId

movieId

Architecture Decisions

Next.js App Router was chosen for modern routing and server component support.

React Query handles API caching and background refetching.

Prisma ORM simplifies database interaction and migration management.

JWT authentication enables stateless authentication for API routes.

Tailwind CSS ensures fast UI development with consistent styling.

Known Limitations

Due to time constraints:

UI polish and animations are minimal

Review sorting/filtering could be improved

Movie recommendations are not implemented

Unit tests could be expanded for better coverage