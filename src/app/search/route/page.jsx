export default async function RoutePage() {
    const data = await fetch('/api/search/route');
    const json = await data.json();

    return <div>{json.message}</div>
}