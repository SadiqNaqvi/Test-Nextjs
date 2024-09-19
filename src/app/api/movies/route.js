import { movie_sort_obj as sortObj } from "@/utils/Data";
export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const genres = params.get("g");
  const cast = params.get("c");
  const sort = params.get("sort") || "popularity";
  const sort_by = sortObj[sort] || sortObj.popularity;
  const page = params.get("p") || 1;
  const year = params.get("p");

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sort_by}
  ${genres ? `&with_genres=${genres}` : ""}
    ${year ? `&with_year=${year}` : ""}
  ${cast ? `&with_cast=${cast}` : ""}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const data = await (await fetch(url, options)).json();

    if (data.status_message)
      return new Response(
        JSON.stringify({ status: false, response: data.status_message })
      );

    return new Response(JSON.stringify({ status: true, response: data }));
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ status: false, response: err.message })
    );
  }
};
