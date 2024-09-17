import { show_sort_obj as sortObj } from "@/utils/Data";

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const sort = params.get("sort") || "popularity";
  const sort_by = sortObj[sort] || sortObj.popularity;
  const page = params.get("p") || 1;
  const year = params.get("y");
  const genres = params.get("g");

  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=${sort_by}
    ${year ? `&first_air_date_year=${year}` : ""}
    ${genres ? `&with_genres=${genres}` : ""}`;
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
