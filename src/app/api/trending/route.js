export const GET = async (req) => {
  const params = req.nextUrl.searchParams;

  const page = params.get("p") || 1;
  const type = params.get("t") || "all"; // movie | person | tv | all

  const url = `https://api.themoviedb.org/3/trending/${type}/week?language=en-US&page=${page}`;
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
