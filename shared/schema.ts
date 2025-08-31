import { z } from "zod";

export const genreEnum = z.enum([
  "action", "adventure", "animation", "comedy", "crime", "documentary",
  "drama", "family", "fantasy", "history", "horror", "music", "mystery",
  "romance", "science_fiction", "thriller", "war", "western"
]);

export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  profilePicture: z.string().url().optional(),
});

export const insertMovieSchema = z.object({
  tmdbId: z.number(),
  title: z.string(),
  synopsis: z.string(),
  director: z.string(),
  cast: z.array(z.string()),
  genres: z.array(genreEnum),
  releaseYear: z.number(),
  duration: z.number(),
  posterUrl: z.string().url(),
  backdropUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
});

export const insertReviewSchema = z.object({
  userId: z.string(),
  movieId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  content: z.string().min(50),
  spoilerWarning: z.boolean().optional(),
});

export const insertWatchlistSchema = z.object({
  userId: z.string(),
  movieId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
