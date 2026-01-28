import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async (
  r: NextRequest,
  { params: { id } }: { params: { id: string } }
) => {
  const [s, i, n] = id.split("-");

  try {
    const response = await fetch(`https://${s}.ranoz.gg/${i}-${n}`, {
      headers: headers(),
    });

    if (response.ok)
      response.headers.set('Cache-Control', 'public, max-age=3600')

    return response;
  } catch (err: any) {
    console.log(err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
};
