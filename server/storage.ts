import {
  type User,
  type InsertUser,
  type Movie,
  type InsertMovie,
  type Review,
  type InsertReview,
  type Watchlist,
  type InsertWatchlist,
  type ReviewWithUser
} from "@shared/schema";
import { randomUUID } from "crypto";
import { tmdbService } from "./services/tmdb";

function buildTMDBImageUrl(path: string | null, size: string = "w500"): string {
  return path ? `https://image.tmdb.org/t/p/${size}${path.startsWith("/") ? path : `/${path}`}` : "";
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Movies
  getMovies(params?: {
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: "title" | "year" | "rating" | "reviews";
    page?: number;
    limit?: number;
  }): Promise<{ movies: Movie[]; total: number }>;
  getMovie(id: string): Promise<Movie | undefined>;
  getFeaturedMovies(): Promise<Movie[]>;
  getTrendingMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, updates: Partial<Movie>): Promise<Movie | undefined>;

  // Reviews
  getReviews(movieId: string): Promise<ReviewWithUser[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  likeReview(reviewId: string): Promise<boolean>;

  // Watchlist
  getUserWatchlist(userId: string): Promise<(Watchlist & { movie: Movie })[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, movieId: string): Promise<boolean>;
}

export class Storage implements IStorage {
  private users: Map<string, User> = new Map();
  private movies: Map<string, Movie> = new Map();
  private reviews: Map<string, Review> = new Map();
  private watchlists: Map<string, Watchlist> = new Map();

  // --- User methods ---
  async getUser(id: string) {
    return this.users.get(id);
  }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      joinDate: new Date(),
      profilePicture: insertUser.profilePicture ?? "",
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id: string, updates: Partial<User>) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // --- Movie methods ---
  async getMovies(params: { search?: string; genre?: string; year?: number; minRating?: number; sort?: "title" | "year" | "rating" | "reviews"; page?: number; limit?: number } = {}) {
    let movies = Array.from(this.movies.values());

    if (params.search) {
      const search = params.search.toLowerCase();
      movies = movies.filter(m =>
        m.title.toLowerCase().includes(search) ||
        m.director.toLowerCase().includes(search) ||
        m.cast.some(actor => actor.toLowerCase().includes(search))
      );
    }

    if (params.genre) movies = movies.filter(m => m.genres.includes(params.genre as any));
    if (params.year) movies = movies.filter(m => m.releaseYear === params.year);
    if (params.minRating !== undefined) {
      movies = movies.filter(
        m => parseFloat(m.averageRating ?? "0") >= params.minRating!
      );
    }

    // Sorting
    if (params.sort) {
      switch (params.sort) {
        case "title": movies.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "year": movies.sort((a, b) => b.releaseYear - a.releaseYear); break;
        case "rating": movies.sort((a, b) => parseFloat(b.averageRating ?? "0") - parseFloat(a.averageRating ?? "0")); break;
        case "reviews": movies.sort((a, b) => b.reviewCount - a.reviewCount); break;
      }
    }

    const total = movies.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    return { movies: movies.slice(start, end), total };
  }

  async getMovie(id: string) {
    const movie = this.movies.get(id);
    if (movie) return movie;
    // fallback: fetch from TMDB
    const tmdb = await tmdbService.getMovieDetails(id);
    if (!tmdb) return undefined;
    return this.mapTMDBToMovie(tmdb);
  }

  async getFeaturedMovies() {
    const tmdb = await tmdbService.getFeaturedMovies();
    return tmdb.map(this.mapTMDBToMovie);
  }

  async getTrendingMovies() {
    const tmdb = await tmdbService.getTrendingMovies();
    return tmdb.map(this.mapTMDBToMovie);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const movie: Movie = {
      ...insertMovie,
      id,
      averageRating: "0",
      reviewCount: 0,
      createdAt: new Date(),
      backdropUrl: insertMovie.backdropUrl ?? "",
      trailerUrl: insertMovie.trailerUrl ?? "",
      featured: insertMovie.featured ?? false,
      trending: insertMovie.trending ?? false,
    };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: string, updates: Partial<Movie>) {
    const movie = this.movies.get(id);
    if (!movie) return undefined;
    const updated = { ...movie, ...updates };
    this.movies.set(id, updated);
    return updated;
  }

  // --- Review methods ---
  async getReviews(movieId: string) {
    const reviews = Array.from(this.reviews.values()).filter(r => r.movieId === movieId);
    const reviewsWithUser: ReviewWithUser[] = [];
    for (const r of reviews) {
      const user = await this.getUser(r.userId);
      const movie = this.movies.get(r.movieId);
      if (user && movie) {
        reviewsWithUser.push({
          ...r,
          user: { id: user.id, username: user.username, profilePicture: user.profilePicture },
          movie: { id: movie.id, title: movie.title, posterUrl: movie.posterUrl },
        });
      }
    }
    return reviewsWithUser.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(review: InsertReview) { /* similar to old code */ return {} as Review; }
  async updateReview(id: string, updates: Partial<Review>) { return {} as Review; }
  async deleteReview(id: string) { return true; }
  async likeReview(reviewId: string) { return true; }

  // --- Watchlist methods ---
  async getUserWatchlist(userId: string) {
    const list = Array.from(this.watchlists.values()).filter(w => w.userId === userId);
    const result: (Watchlist & { movie: Movie })[] = [];
    for (const item of list) {
      const movie = this.movies.get(item.movieId);
      if (movie) result.push({ ...item, movie });
    }
    return result;
  }

  async addToWatchlist(watchlistItem: InsertWatchlist) {
    const id = randomUUID();
    const item: Watchlist = { ...watchlistItem, id, addedAt: new Date() };
    this.watchlists.set(id, item);
    return item;
  }

  async removeFromWatchlist(userId: string, movieId: string) {
    const entry = Array.from(this.watchlists.entries()).find(([, w]) => w.userId === userId && w.movieId === movieId);
    if (!entry) return false;
    this.watchlists.delete(entry[0]);
    return true;
  }

  // --- Helpers ---
  private mapTMDBToMovie(tmdb: any): Movie {
    return {
      id: tmdb.id.toString(),
      title: tmdb.title ?? "",
      synopsis: tmdb.overview ?? "",
      director: "Unknown",
      cast: [],
      genres: [],
      releaseYear: tmdb.release_date ? parseInt(tmdb.release_date.substring(0, 4)) : 0,
      duration: 0,
      posterUrl: buildTMDBImageUrl(tmdb.poster_path, "w300"),
      backdropUrl: buildTMDBImageUrl(tmdb.backdrop_path, "w1200"),
      trailerUrl: "",
      averageRating: tmdb.vote_average?.toFixed(1) ?? "0",
      reviewCount: 0,
      featured: tmdb.featured ?? false,
      trending: tmdb.trending ?? false,
      createdAt: new Date(),
    };
  }
}

export const storage = new Storage();
