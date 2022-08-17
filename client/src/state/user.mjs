import { writable } from "svelte/store"

const login = async () => {
    const url = new URL(document.location.href.toString().replace("#", "?"))
    history.replaceState(
        null,
        document.title,
        location.pathname
    )

    if (url.searchParams.has("access_token") === false) {
        return
    }

    console.log("logging in")
    const res = await fetch(
        "https://api.axel669.net/json-cabinet/login",
        {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: url.searchParams.get("access_token")
            })
        }
    )
}

const user = writable(
    null,
    async (set) => {
        await login()

        const res = await fetch(
            "https://api.axel669.net/json-cabinet/user",
            { credentials: "include" }
        )

        if (res.ok === false) {
            set(false)
            return
        }

        set(
            await res.json()
        )
    }
)

export default user
