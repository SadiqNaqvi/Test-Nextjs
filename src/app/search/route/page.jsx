export default async function RoutePage() {
    const data = await fetch('http://localhost:3000/api/search/route');
    const json = await data.json();

    return <div>{json.message}</div>
}