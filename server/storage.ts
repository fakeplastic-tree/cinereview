import { 
  type User, 
  type InsertUser, 
  type Movie, 
  type InsertMovie,
  type Review,
  type InsertReview,
  type Watchlist,
  type InsertWatchlist,
  type MovieWithReviews,
  type ReviewWithUser
} from "@shared/schema";
import { randomUUID } from "crypto";

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
    sort?: 'title' | 'year' | 'rating' | 'reviews';
    page?: number;
    limit?: number;
  }): Promise<{ movies: Movie[]; total: number }>;
  getMovie(id: string): Promise<MovieWithReviews | undefined>;
  getFeaturedMovies(): Promise<Movie[]>;
  getTrendingMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, updates: Partial<Movie>): Promise<Movie | undefined>;

  // Reviews
  getReviews(movieId: string): Promise<ReviewWithUser[]>;
  getUserReviews(userId: string): Promise<ReviewWithUser[]>;
  getReview(id: string): Promise<ReviewWithUser | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  likeReview(reviewId: string): Promise<boolean>;

  // Watchlist
  getUserWatchlist(userId: string): Promise<(Watchlist & { movie: Movie })[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, movieId: string): Promise<boolean>;
  isInWatchlist(userId: string, movieId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private movies: Map<string, Movie> = new Map();
  private reviews: Map<string, Review> = new Map();
  private watchlists: Map<string, Watchlist> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some sample movies
    const sampleMovies: Movie[] = [
      {
        id: "1",
        title: "Dune: Part Two",
        synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future.",
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"],
        genres: ["science_fiction", "drama", "adventure"],
        releaseYear: 2024,
        duration: 166,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450",
        backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        trailerUrl: "https://example.com/trailer1",
        averageRating: "4.6",
        reviewCount: 2134,
        featured: true,
        trending: true,
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Oppenheimer",
        synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        director: "Christopher Nolan",
        cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr.", "Matt Damon"],
        genres: ["drama", "history", "thriller"],
        releaseYear: 2023,
        duration: 180,
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450",
        backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        trailerUrl: "https://example.com/trailer2",
        averageRating: "4.3",
        reviewCount: 1876,
        featured: false,
        trending: true,
        createdAt: new Date(),
      },
      {
        id: "3",
        title: "Barbie",
        synopsis: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
        director: "Greta Gerwig",
        cast: ["Margot Robbie", "Ryan Gosling", "America Ferrera", "Kate McKinnon"],
        genres: ["comedy", "adventure", "fantasy"],
        releaseYear: 2023,
        duration: 114,
        posterUrl: "https://images.unsplash.com/photo-1489599794619-0db34c4ecbe8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450",
        backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        trailerUrl: "https://example.com/trailer3",
        averageRating: "4.1",
        reviewCount: 3245,
        featured: false,
        trending: true,
        createdAt: new Date(),
      },
      {
        id: "4",
        title: "Spider-Man: Across the Spider-Verse",
        synopsis: "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society.",
        director: "Joaquim Dos Santos",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Brian Tyree Henry", "Luna Lauren Vélez"],
        genres: ["animation", "action", "adventure"],
        releaseYear: 2023,
        duration: 140,
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450",
        backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        trailerUrl: "https://example.com/trailer4",
        averageRating: "4.8",
        reviewCount: 2876,
        featured: false,
        trending: true,
        createdAt: new Date(),
      },
      {
        id: "5",
        title: "The Dark Knight",
        synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
        genres: ["action", "crime", "drama"],
        releaseYear: 2008,
        duration: 152,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450",
        backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        trailerUrl: "https://example.com/trailer5",
        averageRating: "4.6",
        reviewCount: 3421,
        featured: false,
        trending: false,
        createdAt: new Date(),
      },
    ];

    sampleMovies.forEach(movie => this.movies.set(movie.id, movie));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      joinDate: new Date(),
      profilePicture: insertUser.profilePicture || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Movie methods
  async getMovies(params: {
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: 'title' | 'year' | 'rating' | 'reviews';
    page?: number;
    limit?: number;
  } = {}): Promise<{ movies: Movie[]; total: number }> {
    let movies = Array.from(this.movies.values());

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      movies = movies.filter(movie => 
        movie.title.toLowerCase().includes(search) ||
        movie.director.toLowerCase().includes(search) ||
        movie.cast.some(actor => actor.toLowerCase().includes(search))
      );
    }

    if (params.genre) {
      movies = movies.filter(movie => movie.genres.includes(params.genre as any));
    }

    if (params.year) {
      movies = movies.filter(movie => movie.releaseYear === params.year);
    }

    if (params.minRating) {
      movies = movies.filter(movie => parseFloat(movie.averageRating || "0") >= params.minRating!);
    }

    // Apply sorting
    if (params.sort) {
      switch (params.sort) {
        case 'title':
          movies.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'year':
          movies.sort((a, b) => b.releaseYear - a.releaseYear);
          break;
        case 'rating':
          movies.sort((a, b) => parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0"));
          break;
        case 'reviews':
          movies.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    const total = movies.length;

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    movies = movies.slice(start, end);

    return { movies, total };
  }

  async getMovie(id: string): Promise<MovieWithReviews | undefined> {
    const movie = this.movies.get(id);
    if (!movie) return undefined;

    const movieReviews = await this.getReviews(id);
    return {
      ...movie,
      reviews: movieReviews,
    };
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.featured);
  }

  async getTrendingMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.trending);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const movie: Movie = {
      ...insertMovie,
      id,
      averageRating: "0",
      reviewCount: 0,
      createdAt: new Date(),
      backdropUrl: insertMovie.backdropUrl || null,
      trailerUrl: insertMovie.trailerUrl || null,
    };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: string, updates: Partial<Movie>): Promise<Movie | undefined> {
    const movie = this.movies.get(id);
    if (!movie) return undefined;
    
    const updatedMovie = { ...movie, ...updates };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  // Review methods
  async getReviews(movieId: string): Promise<ReviewWithUser[]> {
    const reviews = Array.from(this.reviews.values()).filter(review => review.movieId === movieId);
    const reviewsWithUser: ReviewWithUser[] = [];

    for (const review of reviews) {
      const user = await this.getUser(review.userId);
      const movie = this.movies.get(review.movieId);
      if (user && movie) {
        reviewsWithUser.push({
          ...review,
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
          movie: {
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
          },
        });
      }
    }

    return reviewsWithUser.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserReviews(userId: string): Promise<ReviewWithUser[]> {
    const reviews = Array.from(this.reviews.values()).filter(review => review.userId === userId);
    const reviewsWithUser: ReviewWithUser[] = [];

    for (const review of reviews) {
      const user = await this.getUser(review.userId);
      const movie = this.movies.get(review.movieId);
      if (user && movie) {
        reviewsWithUser.push({
          ...review,
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
          movie: {
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
          },
        });
      }
    }

    return reviewsWithUser.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReview(id: string): Promise<ReviewWithUser | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const user = await this.getUser(review.userId);
    const movie = this.movies.get(review.movieId);
    if (!user || !movie) return undefined;

    return {
      ...review,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      movie: {
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
      },
    };
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      spoilerWarning: insertReview.spoilerWarning || false,
    };
    this.reviews.set(id, review);

    // Update movie's average rating and review count
    await this.updateMovieRating(insertReview.movieId);

    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...updates, updatedAt: new Date() };
    this.reviews.set(id, updatedReview);

    // Update movie's average rating if rating changed
    if (updates.rating !== undefined) {
      await this.updateMovieRating(review.movieId);
    }

    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;

    this.reviews.delete(id);
    await this.updateMovieRating(review.movieId);
    return true;
  }

  async likeReview(reviewId: string): Promise<boolean> {
    const review = this.reviews.get(reviewId);
    if (!review) return false;

    review.likes++;
    this.reviews.set(reviewId, review);
    return true;
  }

  private async updateMovieRating(movieId: string): Promise<void> {
    const movie = this.movies.get(movieId);
    if (!movie) return;

    const movieReviews = Array.from(this.reviews.values()).filter(review => review.movieId === movieId);
    const reviewCount = movieReviews.length;
    
    if (reviewCount === 0) {
      movie.averageRating = "0";
      movie.reviewCount = 0;
    } else {
      const totalRating = movieReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = (totalRating / reviewCount).toFixed(2);
      movie.averageRating = averageRating;
      movie.reviewCount = reviewCount;
    }

    this.movies.set(movieId, movie);
  }

  // Watchlist methods
  async getUserWatchlist(userId: string): Promise<(Watchlist & { movie: Movie })[]> {
    const userWatchlist = Array.from(this.watchlists.values()).filter(item => item.userId === userId);
    const watchlistWithMovies: (Watchlist & { movie: Movie })[] = [];

    for (const item of userWatchlist) {
      const movie = this.movies.get(item.movieId);
      if (movie) {
        watchlistWithMovies.push({
          ...item,
          movie,
        });
      }
    }

    return watchlistWithMovies.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = randomUUID();
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
      addedAt: new Date(),
    };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    const item = Array.from(this.watchlists.values()).find(
      item => item.userId === userId && item.movieId === movieId
    );
    if (!item) return false;

    this.watchlists.delete(item.id);
    return true;
  }

  async isInWatchlist(userId: string, movieId: string): Promise<boolean> {
    return Array.from(this.watchlists.values()).some(
      item => item.userId === userId && item.movieId === movieId
    );
  }
}

export const storage = new MemStorage();
