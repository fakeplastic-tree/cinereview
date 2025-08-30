import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "./star-rating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import type { Movie, InsertReview, ReviewWithUser } from "@shared/schema";

interface ReviewFormProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  existingReview?: ReviewWithUser;
}

export function ReviewForm({ movie, isOpen, onClose, existingReview }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || "",
    content: existingReview?.content || "",
    spoilerWarning: existingReview?.spoilerWarning || false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<InsertReview, 'movieId'>) =>
      api.createReview(movie.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies", movie.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies", movie.id, "reviews"] });
      toast({
        title: "Success",
        description: "Review published successfully!",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish review",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertReview>) =>
      api.updateReview(existingReview!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies", movie.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies", movie.id, "reviews"] });
      toast({
        title: "Success",
        description: "Review updated successfully!",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      rating: 0,
      title: "",
      content: "",
      spoilerWarning: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to write a review",
        variant: "destructive",
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    if (formData.content.length < 50) {
      toast({
        title: "Error",
        description: "Review must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }

    const reviewData = {
      ...formData,
      userId: user.id,
    };

    if (existingReview) {
      updateMutation.mutate(reviewData);
    } else {
      createMutation.mutate(reviewData);
    }
  };

  const handleClose = () => {
    onClose();
    if (!existingReview) {
      resetForm();
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>

        {/* Movie Info */}
        <div className="flex items-center space-x-4 p-4 bg-background rounded-lg">
          <img 
            src={movie.posterUrl} 
            alt={`${movie.title} poster`} 
            className="w-16 h-24 rounded object-cover" 
          />
          <div>
            <h3 className="font-semibold" data-testid="review-form-movie-title">
              {movie.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {movie.releaseYear} • {movie.genres[0]?.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="block text-sm font-medium mb-2">Your Rating</Label>
            <div className="flex items-center space-x-3">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="lg"
              />
              <span className="text-sm text-muted-foreground" data-testid="rating-display">
                {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Click to rate'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title">Review Title</Label>
            <Input
              id="review-title"
              placeholder="Summarize your review in a few words..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              data-testid="input-review-title"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="review-content">Your Review</Label>
            <Textarea
              id="review-content"
              rows={6}
              placeholder="Share your thoughts about the movie. What did you like or dislike? Would you recommend it to others?"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="resize-none"
              required
              data-testid="textarea-review-content"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/50 characters minimum
            </p>
          </div>

          {/* Spoiler Warning */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="spoiler-warning"
              checked={formData.spoilerWarning}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, spoilerWarning: checked as boolean }))
              }
              data-testid="checkbox-spoiler-warning"
            />
            <Label htmlFor="spoiler-warning" className="text-sm">
              This review contains spoilers
            </Label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              data-testid="button-submit-review"
            >
              {isLoading 
                ? (existingReview ? "Updating..." : "Publishing...") 
                : (existingReview ? "Update Review" : "Publish Review")
              }
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
