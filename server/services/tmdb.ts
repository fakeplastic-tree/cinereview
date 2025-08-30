import { z } from "zod";



const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  genre_ids: z.array(z.number()),
});

const tmdbResponseSchema = z.object({
  results: z.array(tmdbMovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

export type TMDBMovie = z.infer<typeof tmdbMovieSchema>;

export class TMDBService {
  async getFeaturedMovies() {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return tmdbResponseSchema.parse(data).results;
  }

  async getTrendingMovies() {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return tmdbResponseSchema.parse(data).results;
  }

  async searchMovies(query: string, page: number = 1) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`
    );
    const data = await response.json();
    return tmdbResponseSchema.parse(data);
  }

  async getMovieDetails(id: string) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    const data = await response.json();
    return data;
  }
}

export const tmdbService = new TMDBService();