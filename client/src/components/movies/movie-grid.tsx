import { MovieCard } from "./movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@shared/schema";

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function MovieGrid({ movies, isLoading = false, columns = 6 }: MovieGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-64 w-full" data-testid={`skeleton-movie-${index}`} />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-movies">
        <p className="text-muted-foreground">No movies found.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`} data-testid="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
