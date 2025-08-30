import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { StarRating } from "./star-rating";
import { formatDistanceToNow } from "date-fns";
import type { ReviewWithUser } from "@shared/schema";
import { useAuth } from "@/components/auth/auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReviewCardProps {
  review: ReviewWithUser;
  onEdit?: (review: ReviewWithUser) => void;
}

export function ReviewCard({ review, onEdit }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);

  const isOwner = user?.id === review.userId;

  const likeMutation = useMutation({
    mutationFn: () => api.likeReview(review.id),
    onSuccess: () => {
      setLiked(!liked);
      queryClient.invalidateQueries({ queryKey: ["/api/movies", review.movieId, "reviews"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like review",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteReview(review.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies", review.movieId, "reviews"] });
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like reviews",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="bg-background rounded-lg p-4" data-testid={`review-${review.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.user.profilePicture || undefined} />
            <AvatarFallback data-testid={`avatar-${review.user.username}`}>
              {review.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium" data-testid={`username-${review.id}`}>
                {review.user.username}
              </span>
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-muted-foreground" data-testid={`rating-${review.id}`}>
                {review.rating}.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground" data-testid={`date-${review.id}`}>
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`menu-${review.id}`}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(review)} data-testid={`edit-${review.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
                data-testid={`delete-${review.id}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mb-3">
        <h4 className="font-medium mb-2" data-testid={`title-${review.id}`}>
          {review.title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`content-${review.id}`}>
          {review.content}
        </p>
      </div>

      {review.spoilerWarning && (
        <Badge variant="destructive" className="mb-3">
          Contains Spoilers
        </Badge>
      )}

      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className="h-auto p-0 text-xs"
          data-testid={`like-${review.id}`}
        >
          <ThumbsUp className={`w-3 h-3 mr-1 ${liked ? 'fill-current' : ''}`} />
          <span>{review.likes + (liked ? 1 : 0)}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" data-testid={`report-${review.id}`}>
          <Flag className="w-3 h-3 mr-1" />
          Report
        </Button>
      </div>
    </div>
  );
}
