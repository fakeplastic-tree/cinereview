import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Plus, Calendar, Clock } from "lucide-react";
import type { Movie } from "@shared/schema";
import { useAuth } from "@/components/auth/auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MovieHeroProps {
  movie: Movie;
}

export function MovieHero({ movie }: MovieHeroProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const rating = parseFloat(movie.averageRating || "0");

  const addToWatchlistMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be logged in");
      return api.addToWatchlist(user.id, movie.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watchlist"] });
      toast({
        title: "Success",
        description: "Movie added to your watchlist!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  const handlePlayTrailer = () => {
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, '_blank');
    } else {
      toast({
        title: "No trailer available",
        description: "Sorry, no trailer is available for this movie.",
      });
    }
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add movies to your watchlist.",
        variant: "destructive",
      });
      return;
    }
    addToWatchlistMutation.mutate();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-accent text-accent" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-5 h-5 fill-accent/50 text-accent" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-muted-foreground" />);
    }

    return stars;
  };

  return (
    <section className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
      />
      <div className="hero-gradient absolute inset-0" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-4" data-testid="featured-badge">
            Featured Film
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="hero-title">
            {movie.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="hero-synopsis">
            {movie.synopsis}
          </p>
          
          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1" data-testid="hero-rating-stars">
                {renderStars(rating)}
              </div>
              <span className="text-foreground font-semibold ml-2" data-testid="hero-rating">
                {rating > 0 ? rating.toFixed(1) : "N/A"}
              </span>
              <span className="text-muted-foreground">/ 5</span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span data-testid="hero-year">{movie.releaseYear}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span data-testid="hero-duration">{movie.duration} min</span>
            </div>
            
            {movie.genres.length > 0 && (
              <Badge variant="outline" data-testid="hero-genre">
                {movie.genres[0].replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={handlePlayTrailer}
              className="flex items-center space-x-2"
              data-testid="button-watch-trailer"
            >
              <Play className="w-4 h-4" />
              <span>Watch Trailer</span>
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleAddToWatchlist}
              disabled={addToWatchlistMutation.isPending}
              className="flex items-center space-x-2"
              data-testid="button-add-watchlist"
            >
              <Plus className="w-4 h-4" />
              <span>
                {addToWatchlistMutation.isPending ? "Adding..." : "Add to Watchlist"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
