import { NextResponse } from "next/server";

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const t = params.get("t");
  const y = params.get("y");

  if (!t || !y)
    return new Response(
      JSON.stringify({
        status: false,
        response: "Invalid IMDB Id!",
      })
    );

  const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API}&t=${t}&y=${y}&plot=full`;

  try {
    const data = await (await fetch(url)).json();

    if (data.Response === "False")
      return new Response(
        JSON.stringify({ status: false, response: data.Error })
      );

    return NextResponse.json({ status: true, response: data })
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: false, response: err.message })
  }
};
