<script>
    import {
        Adornment,
        AppBar,
        Button,

        HexagonSpinner as Spinner,
    } from "svelte-doric"

    import ActiveAccount from "./dashboard/active.svelte"

    import user from "@/state/user.mjs"
    import api from "@/comm/api.mjs"

    let account = api("account.read")

    const runUpdate = async (command, data) => {
        await api(command, data)
        return await api("account.read")
    }
    const updateAccount = (command, data) => account = runUpdate(command, data)

    const activate = () => updateAccount("account.activate")

    const logoutURL = new URL("https://dev-u5o6kihm.us.auth0.com")
    logoutURL.pathname = "/v2/logout"
    logoutURL.searchParams.append("returnTo", location.href)
    logoutURL.searchParams.append(
        "client_id",
        "SDkK9ff67yfshXZZRLuKagsnLDb1J99d"
    )
    const logout = async () => {
        await fetch(
            "https://api.axel669.net/json-cabinet/logout",
            { credentials: "include" }
        )
        location.href = logoutURL.href
    }
</script>

<AppBar>
    JSON Cabinet - {$user.displayName}

    <Adornment slot="action">
        <Button adorn on:tap={logout}>
            Logout
        </Button>
    </Adornment>
</AppBar>

{#await account}
    <Spinner size={150} />
{:then account}
    {#if account === null}
        Account inactive
        <div>
            <Button on:tap={activate}>
                Activate
            </Button>
        </div>
    {:else}
        <ActiveAccount {updateAccount} {account} />
    {/if}
{/await}
