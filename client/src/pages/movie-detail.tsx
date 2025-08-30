import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { StarRating } from "@/components/reviews/star-rating";
import { Play, Plus, Edit, ArrowLeft, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { MovieWithReviews, ReviewWithUser } from "@shared/schema";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithUser | undefined>();

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ["/api/movies", id],
    queryFn: () => api.getMovie(id!),
    enabled: !!id,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be logged in");
      return api.addToWatchlist(user.id, id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watchlist"] });
      toast({ title: "Success", description: "Movie added to your watchlist!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add to watchlist", variant: "destructive" });
    },
  });

  const handlePlayTrailer = () => {
    if (movie?.trailerUrl) {
      window.open(movie.trailerUrl, "_blank");
    } else {
      toast({ title: "No trailer available", description: "Sorry, no trailer is available for this movie." });
    }
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to add movies to your watchlist.", variant: "destructive" });
      return;
    }
    addToWatchlistMutation.mutate();
  };

const handleWriteReview = () => {
  if (!isAuthenticated) {
    toast({
      title: "Login required",
      description: "Please log in to write a review.",
      variant: "destructive",
    });
    return;
  }
  if (!movie) return; // extra safety
  setEditingReview(undefined);
  setIsReviewFormOpen(true);
};

const handleEditReview = (review?: ReviewWithUser) => {
  if (!isAuthenticated) {
    toast({
      title: "Login required",
      description: "Please log in to edit your review.",
      variant: "destructive",
    });
    return;
  }
  if (!movie || !review) return; // extra safety
  setEditingReview({
    ...review,
    movie: {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
    },
  });
  setIsReviewFormOpen(true);
};

  const handleCloseReviewForm = () => {
    setIsReviewFormOpen(false);
    setEditingReview(undefined);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Movie Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find the movie you're looking for.</p>
          <Link href="/movies">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) return null;

  const cast = movie.cast ?? [];
  const reviews = movie.reviews ?? [];
  const genres = movie.genres ?? [];
  const rating = parseFloat(movie.averageRating ?? "0");
  const userReview = reviews.find(review => review.userId === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/movies">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>

        {/* Movie Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <div className="lg:col-span-1">
            <img src={movie.posterUrl} alt={`${movie.title} poster`} className="w-full rounded-lg shadow-lg" />
          </div>

          {/* Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{movie.synopsis}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-muted-foreground">Director:</span>
                <span className="ml-2 font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">{movie.duration} min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Genres:</span>
                <span className="ml-2 font-medium">{genres.map(g => g.replace('_', ' ')).join(', ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Release Year:</span>
                <span className="ml-2 font-medium">{movie.releaseYear}</span>
              </div>
            </div>

            {/* Rating and Actions */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center space-x-2">
                <StarRating rating={rating} readonly size="md" />
                <span className="font-semibold text-lg">{rating > 0 ? rating.toFixed(1) : "N/A"}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePlayTrailer} className="flex items-center space-x-2">
                <Play className="w-4 h-4" /> Watch Trailer
              </Button>

              <Button variant="secondary" onClick={handleAddToWatchlist} disabled={addToWatchlistMutation.isPending} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>{addToWatchlistMutation.isPending ? "Adding..." : "Add to Watchlist"}</span>
              </Button>

              {userReview ? (
  <Button
    variant="outline"
    onClick={() => handleEditReview({
      ...userReview,
      movie: {
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl
      }
    })}
    className="flex items-center space-x-2"
  >
    <Edit className="w-4 h-4" />
    <span>Edit Your Review</span>
  </Button>
) : (
  <Button
    variant="outline"
    onClick={handleWriteReview}
    className="flex items-center space-x-2"
  >
    <Edit className="w-4 h-4" />
    <span>Write Review</span>
  </Button>
)}
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2" /> Cast
            </h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {cast.map((actor, idx) => (
                <div key={idx} className="flex-shrink-0 text-center">
                  <Avatar className="w-16 h-16 mb-2 mx-auto">
                    <AvatarFallback>{actor.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium w-20">{actor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Reviews ({reviews.length})</h3>
            {!userReview && <Button onClick={handleWriteReview}>Write a Review</Button>}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg">
              <p className="text-muted-foreground mb-4">No reviews yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts about this movie!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(r => (
                <ReviewCard key={r.id} review={{ ...r, movie: { id: movie.id, title: movie.title, posterUrl: movie.posterUrl } }} onEdit={user?.id === r.userId ? handleEditReview : undefined} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {movie && (
        <ReviewForm movie={movie} isOpen={isReviewFormOpen} onClose={handleCloseReviewForm} existingReview={editingReview} />
      )}

      <Footer />
    </div>
  );
}
