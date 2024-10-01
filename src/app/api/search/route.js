export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const query = params.get("q");
  const page = params.get("p") || 1;
  const type = params.get("t") || "multi"; //collection | company | movie | person | show

  if (!query)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid Query!",
      })
    );

  const url = `https://api.themoviedb.org/3/search/${type}?query=${query}&include_adult=false&language=en-US&page=${page}`;
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
