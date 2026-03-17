# Movie Review Application

## 1. Project Overview

The **Movie Review Application** is a full-stack web application that allows users to search for movies, view detailed information, and submit their own reviews.

The application integrates with **The Movie Database (TMDB) API** to fetch movie data such as posters, descriptions, and trailers. Users can create accounts, log in securely, and write or manage their own reviews for movies.

### Tech Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* React Query

**Backend**

* Node.js
* Express.js
* REST API architecture
* JWT authentication

**Database**

* SQLite
* Prisma ORM

---

## 2. Prerequisites

Before running the project locally, ensure you have the following installed:

| Tool              | Version |
| ----------------- | ------- |
| Node.js           | >= 18   |
| npm / pnpm / yarn | Latest  |
| Git               | Latest  |

You will also need a **TMDB API key**.

Create one here:
https://developer.themoviedb.org/

---

## 3. Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```
git clone https://github.com/your-username/movie-review-app.git
cd movie-review-app
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend folder.

```
cp .env.example .env
```

Fill in the required values.

### 4. Run database migrations

```
npx prisma migrate dev
```

### 5. Seed the database

```
npm run seed
```

### 6. Start the development servers

Backend:

```
npm run server
```

Frontend:

```
npm run client
```

Application URLs:

```
Frontend: http://localhost:3008
Backend:  http://localhost:5000
```

---

## 4. Environment Variables

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| DATABASE_URL       | SQLite database connection string |
| JWT_SECRET         | Secret used to sign access tokens |
| JWT_REFRESH_SECRET | Secret used for refresh tokens    |
| TMDB_API_KEY       | API key for The Movie Database    |
| PORT               | Backend server port               |

## 5. Database Setup

The application uses **SQLite with Prisma ORM**.

### Run migrations

```
npx prisma migrate dev
```

### Generate Prisma client

```
npx prisma generate
```

### Seed sample data

```
npm run seed
```

The seed script creates:

* Sample users
* Sample reviews

The SQLite database file is excluded from version control.

---

## 6. Architecture Decisions

Several decisions were made to keep the project maintainable and scalable.

**Next.js App Router**
Chosen for its modern routing system and support for server components.

**React Query**
Used to manage API calls, caching, and background updates efficiently.

**JWT Authentication**
Provides stateless authentication and works well with REST APIs.

**Prisma ORM**
Simplifies database interaction, schema definition, and migrations.

**Separation of Client and Server**
The project separates frontend and backend logic to maintain clear responsibilities.

---

## 7. Known Limitations

Due to the limited time frame for the assignment, some improvements could be made:

* UI/UX design could be further polished
* Advanced movie filtering (genre, year, rating) is not implemented
* Automated tests are minimal
* Performance optimizations for large review lists could be improved
* Accessibility features (ARIA labels, keyboard navigation) could be expanded

Future improvements would include adding unit tests, Docker support, better caching strategies, and improved UI responsiveness.
