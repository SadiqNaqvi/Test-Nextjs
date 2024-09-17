export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid IMDB Id!",
      })
    );

  const url = `http://img.omdbapi.com/?apikey=${process.env.OMDB_API}&i=${id}&plot=full`;

  try {
    const data = await (await fetch(url)).json();

    if (!data.Response)
      return new Response(
        JSON.stringify({ status: false, response: data.Error })
      );

    return new Response(JSON.stringify({ status: true, response: data }));
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ status: false, response: err.message })
    );
  }
};
