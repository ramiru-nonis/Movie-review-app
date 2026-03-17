export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Review {
  id: string;
  rating: number;
  reviewText: string;
  userId: string;
  movieId: number;
  createdAt: string;
  user: {
    username: string;
  };
}
