import { Link } from "wouter";
import { Star, Calendar } from "lucide-react";
import { type Movie } from "@shared/types";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.png';

  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="movie-card bg-card rounded-lg overflow-hidden cursor-pointer" data-testid={`card-movie-${movie.id}`}>
        <div className="relative">
          <img 
            src={posterUrl}
            alt={movie.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2" data-testid={`title-${movie.id}`}>
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="star-rating w-3 h-3 fill-current" />
              <span className="text-xs text-muted-foreground" data-testid={`rating-text-${movie.id}`}>
                {movie.vote_average > 0 ? (movie.vote_average / 2).toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span data-testid={`year-${movie.id}`}>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
