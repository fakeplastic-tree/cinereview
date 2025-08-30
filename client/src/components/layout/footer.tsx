import { Link } from "wouter";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Film className="text-primary text-xl" />
              <span className="text-lg font-bold">CineReview</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover, review, and share your favorite movies with a community of film enthusiasts.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Movies</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/movies" className="hover:text-foreground transition-colors">Browse All</Link></li>
              <li><Link href="/movies?sort=rating" className="hover:text-foreground transition-colors">Top Rated</Link></li>
              <li><Link href="/movies?sort=year" className="hover:text-foreground transition-colors">Latest</Link></li>
              <li><Link href="/movies?sort=reviews" className="hover:text-foreground transition-colors">Most Reviewed</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Reviews</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Discussions</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Top Reviewers</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Watchlists</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact Us</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; 2024 CineReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
