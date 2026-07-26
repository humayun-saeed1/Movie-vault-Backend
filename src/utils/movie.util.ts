export const calculateAverageRating = (reviews: { rating: number }[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};

export const mapMoviesWithAverageRating = (movies: any[]) => {
  return movies.map(movie => {
    const avg = calculateAverageRating(movie.reviews);
    return { ...movie, averageRating: avg };
  });
};
