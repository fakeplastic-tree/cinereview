import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/movies/search-filters";
import { MovieGrid } from "@/components/movies/movie-grid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

export default function Movies() {
  const [location] = useLocation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    genre?: string;
    year?: number;
    minRating?: number;
    sort?: string;
  }>({});

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: typeof filters = {};
    
    if (urlParams.get('search')) initialFilters.search = urlParams.get('search')!;
    if (urlParams.get('genre')) initialFilters.genre = urlParams.get('genre')!;
    if (urlParams.get('year')) initialFilters.year = parseInt(urlParams.get('year')!);
    if (urlParams.get('minRating')) initialFilters.minRating = parseFloat(urlParams.get('minRating')!);
    if (urlParams.get('sort')) initialFilters.sort = urlParams.get('sort')!;

    setFilters(initialFilters);
  }, [location]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/movies", { ...filters, page, limit: 20 }],
    queryFn: () => api.getMovies({ ...filters, page, limit: 20 }),
  });

  const movies = data?.movies || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change

    // Update URL
    const urlParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        urlParams.set(key, value.toString());
      }
    });
    const newUrl = `/movies${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Movies</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't load the movies. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8" data-testid="page-title">
          Discover Movies
        </h1>
        
        <SearchFilters 
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground" data-testid="results-summary">
            {isLoading ? "Loading..." : `Showing ${movies.length} of ${total} movies`}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Movie Grid */}
        <MovieGrid movies={movies} isLoading={isLoading} columns={5} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2" data-testid="pagination">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                data-testid="button-previous-page"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </nav>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
