export const formatPaginatedResponse = (data: any[], total: number, page: string, limit: string) => {
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  return {
    movies: data,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber)
  };
};
