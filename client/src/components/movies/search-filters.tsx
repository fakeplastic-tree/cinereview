import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: string;
  }) => void;
  initialFilters?: {
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: string;
  };
}

const genres = [
  "action", "adventure", "animation", "comedy", "crime", "documentary",
  "drama", "family", "fantasy", "history", "horror", "music", "mystery",
  "romance", "science_fiction", "thriller", "war", "western"
];

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const sortOptions = [
  { value: "title", label: "Title" },
  { value: "year", label: "Year" },
  { value: "rating", label: "Rating" },
  { value: "reviews", label: "Most Reviewed" },
];

export function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    genre: initialFilters.genre || "",
    year: initialFilters.year || undefined,
    minRating: initialFilters.minRating || undefined,
    sort: initialFilters.sort || "title",
  });

  const [activeFilter, setActiveFilter] = useState("popular");

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(filters);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value
    }));
  };

  const handleQuickFilter = (filter: string) => {
    setActiveFilter(filter);
    switch (filter) {
      case "popular":
        setFilters(prev => ({ ...prev, sort: "reviews" }));
        break;
      case "latest":
        setFilters(prev => ({ ...prev, sort: "year" }));
        break;
      case "top_rated":
        setFilters(prev => ({ ...prev, sort: "rating" }));
        break;
      case "upcoming":
        setFilters(prev => ({ ...prev, year: new Date().getFullYear() + 1 }));
        break;
    }
  };

  return (
    <div className="bg-background rounded-lg p-6 mb-8">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <Label className="block text-sm font-medium mb-2">Search</Label>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Movie title, actor, director..." 
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pr-10"
              data-testid="input-search-movies"
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="ghost" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              data-testid="button-search-submit"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Genre</Label>
          <Select value={filters.genre} onValueChange={(value) => handleFilterChange("genre", value)}>
            <SelectTrigger data-testid="select-genre">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Year</Label>
          <Select value={filters.year?.toString() || ""} onValueChange={(value) => handleFilterChange("year", value ? parseInt(value) : undefined)}>
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Minimum Rating</Label>
          <Select value={filters.minRating?.toString() || ""} onValueChange={(value) => handleFilterChange("minRating", value ? parseFloat(value) : undefined)}>
            <SelectTrigger data-testid="select-rating">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.0">4.0+ Stars</SelectItem>
              <SelectItem value="3.5">3.5+ Stars</SelectItem>
              <SelectItem value="3.0">3.0+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
      
      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilter === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter("popular")}
          className="filter-pill"
          data-testid="filter-popular"
        >
          Popular
        </Button>
        <Button
          variant={activeFilter === "latest" ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter("latest")}
          className="filter-pill"
          data-testid="filter-latest"
        >
          Latest
        </Button>
        <Button
          variant={activeFilter === "top_rated" ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter("top_rated")}
          className="filter-pill"
          data-testid="filter-top-rated"
        >
          Top Rated
        </Button>
        <Button
          variant={activeFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter("upcoming")}
          className="filter-pill"
          data-testid="filter-upcoming"
        >
          Upcoming
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground" data-testid="results-count">
          Search and filter movies
        </span>
        <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
          <SelectTrigger className="w-48" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                Sort by {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
