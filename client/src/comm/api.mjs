const baseURL = "https://api.axel669.net/json-cabinet/admin/"

const post = async (command, data = null) => {
    const res = await fetch(
        `${baseURL}${command}`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        }
    )

    return await res.json()
}

export default post
