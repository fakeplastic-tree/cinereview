import { apiRequest } from "./queryClient";
import type { 
  Movie, 
  User, 
  Review, 
  InsertReview, 
  InsertUser,
  MovieWithReviews,
  ReviewWithUser,
  Watchlist
} from "@shared/schema";

export const api = {
  // Auth
  register: (userData: InsertUser) =>
    apiRequest("POST", "/api/auth/register", userData),
  
  login: (credentials: { username: string; password: string }) =>
    apiRequest("POST", "/api/auth/login", credentials),

  // Movies
  getMovies: async (params?: {
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ movies: Movie[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`/api/movies?${queryParams}`);
    return response.json();
  },

  getFeaturedMovies: async (): Promise<Movie[]> => {
    const response = await fetch("/api/movies/featured");
    return response.json();
  },

  getTrendingMovies: async (): Promise<Movie[]> => {
    const response = await fetch("/api/movies/trending");
    return response.json();
  },

  getMovie: async (id: string): Promise<MovieWithReviews> => {
    const response = await fetch(`/api/movies/${id}`);
    return response.json();
  },

  // Reviews
  getMovieReviews: async (movieId: string): Promise<ReviewWithUser[]> => {
    const response = await fetch(`/api/movies/${movieId}/reviews`);
    return response.json();
  },

  createReview: (movieId: string, reviewData: Omit<InsertReview, 'movieId'>) =>
    apiRequest("POST", `/api/movies/${movieId}/reviews`, reviewData),

  updateReview: (reviewId: string, updates: Partial<InsertReview>) =>
    apiRequest("PUT", `/api/reviews/${reviewId}`, updates),

  deleteReview: (reviewId: string) =>
    apiRequest("DELETE", `/api/reviews/${reviewId}`),

  likeReview: (reviewId: string) =>
    apiRequest("POST", `/api/reviews/${reviewId}/like`),

  // Users
  getUser: async (id: string): Promise<Omit<User, 'password'>> => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },

  getUserReviews: async (userId: string): Promise<ReviewWithUser[]> => {
    const response = await fetch(`/api/users/${userId}/reviews`);
    return response.json();
  },

  // Watchlist
  getUserWatchlist: async (userId: string): Promise<(Watchlist & { movie: Movie })[]> => {
    const response = await fetch(`/api/users/${userId}/watchlist`);
    return response.json();
  },

  addToWatchlist: (userId: string, movieId: string) =>
    apiRequest("POST", `/api/users/${userId}/watchlist`, { movieId }),

  removeFromWatchlist: (userId: string, movieId: string) =>
    apiRequest("DELETE", `/api/users/${userId}/watchlist/${movieId}`),
};
