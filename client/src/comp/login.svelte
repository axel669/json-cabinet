<script>
    import {
        Button,
    } from "svelte-doric"

    const clientID = "SDkK9ff67yfshXZZRLuKagsnLDb1J99d"
    const redirectURI = `${location.origin}/dashboard.html`
    const responseType = "token"
    const scope = [
        "profile",
        "openid",
        "email",
    ].join(" ")

    let form = null
    const login = () => form.submit()
</script>

<style>
    form {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>

<form action="https://dev-u5o6kihm.us.auth0.com/oauth2/authorize" bind:this={form}>
    <input type="hidden" name="client_id" value={clientID} />
    <input type="hidden" name="redirect_uri" value={redirectURI} />
    <input type="hidden" name="response_type" value={responseType} />
    <input type="hidden" name="scope" value={scope} />
    <Button on:tap={login} variant="fill" color="primary">
        Login
    </Button>
</form>
