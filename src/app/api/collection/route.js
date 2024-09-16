export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const collection_id = params.get("id");
  if (!collection_id) throw new Error("Invalid collection id");
  const url = `https://api.themoviedb.org/3/collection/${collection_id}?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
  };

  try {
    const resp = await fetch(url, options);
    const data = await resp.json();
    return new Response(JSON.stringify({ status: true, response: data }));
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ status: false }));
  }
};
