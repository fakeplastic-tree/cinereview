import { z } from "zod";

export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  genre_ids: z.array(z.number()),
});

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  created_at: z.date(),
});

export const reviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  movie_id: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  likes: z.number().default(0),
});

export type Movie = z.infer<typeof movieSchema>;
export type User = z.infer<typeof userSchema>;
export type Review = z.infer<typeof reviewSchema>;
