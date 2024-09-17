export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid Network Id!",
      })
    );

  const url = `https://api.themoviedb.org/3/network/${id}`;
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
