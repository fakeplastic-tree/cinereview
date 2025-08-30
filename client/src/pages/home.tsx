import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MovieHero } from "@/components/movies/movie-hero";
import { MovieGrid } from "@/components/movies/movie-grid";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { api } from "@/lib/api";

export default function Home() {
  const { data: featuredMovies = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/movies/featured"],
    queryFn: () => api.getFeaturedMovies(),
  });

  const { data: trendingMovies = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/movies/trending"],
    queryFn: () => api.getTrendingMovies(),
  });

  const featuredMovie = featuredMovies[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      {featuredMovie && <MovieHero movie={featuredMovie} />}
      
      {/* Trending Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground" data-testid="trending-heading">
              Trending Now
            </h2>
            <Link href="/movies?sort=reviews">
              <Button variant="link" data-testid="link-view-all-trending">
                View All
              </Button>
            </Link>
          </div>
          
          <MovieGrid 
            movies={trendingMovies.slice(0, 6)} 
            isLoading={trendingLoading} 
            columns={6}
          />
        </div>
      </section>

      {/* Featured Section */}
      {featuredMovies.length > 1 && (
        <section className="py-12 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground" data-testid="featured-heading">
                Featured Movies
              </h2>
              <Link href="/movies">
                <Button variant="link" data-testid="link-view-all-movies">
                  Explore More
                </Button>
              </Link>
            </div>
            
            <MovieGrid 
              movies={featuredMovies.slice(1, 7)} 
              isLoading={featuredLoading} 
              columns={6}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
