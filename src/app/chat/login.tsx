"use client";

import { useEffect, useState } from "react";

const LoginPage = ({ login }: { login: (u: string) => void }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        setUsername(localStorage.getItem("username") ?? "");
    }, []);

    if (username) {
        return (
            <section className="size-screen flex flex-col flex-cntr-all">
                <h1 className="text-2xl font-semibold text-center">Welcome back {username}</h1>
                <button className="mt-4 mx-auto" onClick={() => login(username)}>Login</button>
            </section>
        )
    }

    const applyUsername = (formData: FormData) => {
        const username = formData.get("username")?.toString();
        if (!username) return;
        localStorage.setItem("username", username);
        login(username);
    }

    return (
        <section className="size-screen flex flex-col flex-cntr-all">
            <h1 className="text-2xl font-semibold text-center">Welcome</h1>
            <form action={applyUsername}>
                <input className="py-2 px-4 bg-transparent border border-gray-500 rounded-md" name="username" placeholder="Username" />
                <button className="mt-4 mx-auto block">Login</button>
            </form>
        </section>
    )
}

export default LoginPage;