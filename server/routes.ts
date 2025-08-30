import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertReviewSchema, insertWatchlistSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Movie routes
  app.get("/api/movies", async (req, res) => {
    try {
      const {
        search,
        genre,
        year,
        minRating,
        sort = 'title',
        page = '1',
        limit = '20'
      } = req.query;

      const params = {
        search: search as string,
        genre: genre as string,
        year: year ? parseInt(year as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        sort: sort as 'title' | 'year' | 'rating' | 'reviews',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getMovies(params);
      res.json(result);
    } catch (error) {
      
      console.log(error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/featured", async (req, res) => {
    try {
      const movies = await storage.getFeaturedMovies();
      res.json(movies);
    } catch (error) {
      
      console.log(error);
      res.status(500).json({ message: "Failed to fetch featured movies" });
    }
  });

  app.get("/api/movies/trending", async (req, res) => {
    try {
      const movies = await storage.getTrendingMovies();
      res.json(movies);
    } catch (error) {
      
      console.log(error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Review routes
  app.get("/api/movies/:movieId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.movieId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/movies/:movieId/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        movieId: req.params.movieId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const updates = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(req.params.id, updates);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const success = await storage.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  app.post("/api/reviews/:id/like", async (req, res) => {
    try {
      const success = await storage.likeReview(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like review" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getUserReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  app.get("/api/users/:id/watchlist", async (req, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(req.params.id);
      res.json(watchlist);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/users/:id/watchlist", async (req, res) => {
    try {
      const watchlistData = insertWatchlistSchema.parse({
        userId: req.params.id,
        movieId: req.body.movieId,
      });
      
      // Check if already in watchlist
      const exists = await storage.isInWatchlist(watchlistData.userId, watchlistData.movieId);
      if (exists) {
        return res.status(400).json({ message: "Movie already in watchlist" });
      }

      const watchlistItem = await storage.addToWatchlist(watchlistData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/users/:id/watchlist/:movieId", async (req, res) => {
    try {
      const success = await storage.removeFromWatchlist(req.params.id, req.params.movieId);
      if (!success) {
        return res.status(404).json({ message: "Movie not in watchlist" });
      }
      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
