import { NextResponse } from "next/server";

export const GET = async (res, { params: { username } }) => {
  const page = res.nextUrl.searchParams.get("o");

  try {
    const response = await fetch(
      `https://kemono.su/api/v1/patreon/user/${username}/posts-legacy?o=${page}`,
      { next: { revalidate: 60 * 60 * 24 } }
    ).then((res) => res.json());

    if (response.error)
      return NextResponse.json({
        result: null,
        success: false,
        error: response.error,
      });

    return NextResponse.json({
      result: response,
      success: true,
      error: null,
    });
  } catch (err) {
    return NextResponse.json({
      result: null,
      success: false,
      error: err.message,
    });
  }
};
