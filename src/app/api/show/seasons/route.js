export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const season = params.get("s") || 1;

  if (!id)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid Show Id!",
      })
    );

  const url = `https://api.themoviedb.org/3/tv/${id}/season/${season}?append_to_response=aggregate_credits%2Cvideos&language=en-US`;
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
        JSON.stringify({ status: false, response: status_message })
      );

    return new Response(JSON.stringify({ status: true, response: data }));
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ status: false, response: err.message })
    );
  }
};
