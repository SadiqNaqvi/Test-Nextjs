import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  res: NextRequest,
  { params: { username } }: { params: { username: string } }
) => {
  const page = res.nextUrl.searchParams.get("o");

  try {
    const response = await fetch(
      `https://coomer.su/api/v1/fansly/user/${username}/posts-legacy?o=${page}`
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
  } catch (err: any) {
    return NextResponse.json({
      result: null,
      success: false,
      error: err.message,
    });
  }
};
