import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, onRatingChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoveredRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const displayRating = hoveredRating || rating;
    const isFilled = starRating <= displayRating;
    const isHalfFilled = !isFilled && starRating - 0.5 <= displayRating;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(starRating)}
        onMouseEnter={() => handleMouseEnter(starRating)}
        onMouseLeave={handleMouseLeave}
        disabled={readonly}
        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        data-testid={`star-${starRating}`}
      >
        <Star
          className={`${sizeClasses[size]} transition-colors ${
            isFilled
              ? 'fill-accent text-accent'
              : isHalfFilled
              ? 'fill-accent/50 text-accent'
              : 'text-muted-foreground'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1" data-testid="star-rating">
      {Array.from({ length: 5 }, (_, index) => renderStar(index))}
    </div>
  );
}
