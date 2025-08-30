import { Link } from "wouter";
import { Star, Calendar } from "lucide-react";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
  showRating?: boolean;
}

export function MovieCard({ movie, showRating = true }: MovieCardProps) {
  const rating = parseFloat(movie.averageRating || "0");

  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="movie-card bg-card rounded-lg overflow-hidden cursor-pointer" data-testid={`card-movie-${movie.id}`}>
        <div className="relative">
          <img 
            src={movie.posterUrl} 
            alt={`${movie.title} poster`} 
            className="w-full h-64 object-cover" 
          />
          {showRating && rating > 0 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
              <span data-testid={`rating-${movie.id}`}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2" data-testid={`title-${movie.id}`}>
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            {showRating && (
              <div className="flex items-center space-x-1">
                <Star className="star-rating w-3 h-3 fill-current" />
                <span className="text-xs text-muted-foreground" data-testid={`rating-text-${movie.id}`}>
                  {rating > 0 ? rating.toFixed(1) : "N/A"}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span data-testid={`year-${movie.id}`}>{movie.releaseYear}</span>
            </div>
          </div>
          {movie.reviewCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1" data-testid={`review-count-${movie.id}`}>
              ({movie.reviewCount} reviews)
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
