import { NextResponse } from "next/server";

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  const page = parseInt(params.get("p") || "1") || 1;

  if (!id)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid Show Id!",
      })
    );

  const url = `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API}`,
    },
    cache: "no-cache",
  };

  try {
    const data = await (await fetch(url, options)).json();

    if (data.status_message)
      return NextResponse.json({ status: false, response: data.status_message})

    return NextResponse.json({ status: true, response: data })
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message })
  }
};
