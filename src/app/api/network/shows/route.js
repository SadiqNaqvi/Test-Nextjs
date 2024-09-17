import { show_sort_obj as sortObj } from "@/utils/Data";

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const sort = params.get("sort") || "popularity";
  const sort_by = sortObj[sort] || sortObj.popularity;
  const page = params.get("p") || 1;

  if (!id)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid Network Id!",
      })
    );

  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=${sort_by}&with_networks=${id}`;
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
