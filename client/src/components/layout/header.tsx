import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Search, User, LogOut } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/components/auth/auth-context";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <Film className="text-primary text-2xl" />
              <span className="text-xl font-bold text-foreground">CineReview</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className={`transition-colors ${location === "/" ? "text-foreground" : "text-muted-foreground hover:text-primary"}`}
                data-testid="link-nav-home"
              >
                Home
              </Link>
              <Link 
                href="/movies" 
                className={`transition-colors ${location === "/movies" ? "text-foreground" : "text-muted-foreground hover:text-primary"}`}
                data-testid="link-nav-movies"
              >
                Movies
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input 
                type="text" 
                placeholder="Search movies, actors, directors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border border-border rounded-lg py-2 pl-10 pr-4 w-80 focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </form>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-user-menu">
                    <User className="h-4 w-4 mr-2" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.id}`} data-testid="link-profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginForm>
                <Button data-testid="button-sign-in">Sign In</Button>
              </LoginForm>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
