import { Storage } from "./storage";

export async function seed(storage: Storage) {
  const defaultUser = await storage.getUserByUsername("default");

  if (!defaultUser) {
    await storage.createUser({
      username: "default",
      email: "default@example.com",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?u=default",
    });
  }

  const movies = [
    {
      tmdbId: 27205,
      title: "Inception",
      synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
      genres: ["ACTION", "ADVENTURE", "SCIENCE_FICTION"],
      releaseYear: 2010,
      duration: 148,
      posterUrl: "/inception.jpg",
      averageRating: 4.4,
      featured: true,
      trending: false,
      backdropUrl: "",
      trailerUrl: "",
      reviewCount: 0,
    },
    {
      tmdbId: 278,
      title: "The Shawshank Redemption",
      synopsis: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      genres: ["DRAMA"],
      releaseYear: 1994,
      duration: 142,
      posterUrl: "/shawshank.jpg",
      averageRating: 4.65,
      trending: true,
      featured: false,
      backdropUrl: "",
      trailerUrl: "",
      reviewCount: 0,
    },
    {
      tmdbId: 155,
      title: "The Dark Knight",
      synopsis: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
      genres: ["ACTION", "CRIME", "DRAMA"],
      releaseYear: 2008,
      duration: 152,
      posterUrl: "/dark_knight.jpg",
      averageRating: 4.5,
      featured: true,
      trending: false,
      backdropUrl: "",
      trailerUrl: "",
      reviewCount: 0,
    },
  ];

  for (const movie of movies) {
    const existingMovie = await storage.getMovieByTmdbId(movie.tmdbId);
    if (!existingMovie) {
      await storage.createMovie(movie);
    }
  }
}
