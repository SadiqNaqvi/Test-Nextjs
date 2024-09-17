export const movie_sort_obj = {
  popularity: "popularity.desc",
  rating: "vote_average.desc&vote_count.gte=200",
  year: "primary_release_date.desc",
  title: "title.asc",
};

export const show_sort_obj = {
  popularity: "popularity.desc",
  rating: "vote_average.desc&vote_count.gte=200",
  year: "first_air_date.desc",
  title: "name.asc",
};
