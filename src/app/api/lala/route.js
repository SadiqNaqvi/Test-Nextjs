export function GET() {
  return new Response(JSON.stringify({ status: true, message: "/api/lala" }));
}
