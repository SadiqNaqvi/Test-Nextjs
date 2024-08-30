export default async function RoutePage() {
    const data = await fetch('/');
    console.log(await data.json())

    return <div>Loading...</div>
}