export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends TMDBMovie {
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
  videos: {
    results: { key: string; type: string }[];
  };
}

export class TMDBService {
  async getFeaturedMovies(): Promise<TMDBMovie[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    const data: TMDBResponse = await response.json();
    return data.results;
  }

  async getTrendingMovies(): Promise<TMDBMovie[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const data: TMDBResponse = await response.json();
    return data.results;
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`
    );
    const data: TMDBResponse = await response.json();
    return data;
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    const data: MovieDetails = await response.json();
    return data;
  }
}

export const tmdbService = new TMDBService();
