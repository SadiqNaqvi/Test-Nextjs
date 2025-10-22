export const movie_genres: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sciencefiction: 878,
  tvmovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

export const show_genres: Record<string, number> = {
  action: 10759,
  adventure: 10759,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  news: 10763,
  reality: 10764,
  scifi: 10765,
  fantasy: 10765,
  soap: 10766,
  talk: 10767,
  war: 10768,
  politics: 10768,
  western: 37,
};

export const movie_sort = {
  popularity: "popularity.desc",
  rating: "vote_average.desc&vote_count.gte=200",
  year: "primary_release_date.desc",
  title: "title.asc",
};

export const show_sort = {
  popularity: "popularity.desc",
  rating: "vote_average.desc&vote_count.gte=200",
  year: "first_air_date.desc",
  title: "name.asc",
};

export const urlPattern =
  /^https:\/\/(www\.)?[a-zA-Z0-9-]{2,}(\.[a-zA-Z0-9-]{2,})+(\/[^\s]*)?(\?[^\s]*)?$/;

export const mediaUrlPattern =
  /^(https:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-%.~+\/]*)*(\.(jpg|jpeg|png|bmp|webp|mp4|mov|avi|mkv|flv|wmv|webm|3gp))(?=[\/?]|$)/i;