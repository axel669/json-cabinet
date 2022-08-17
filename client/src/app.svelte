<script>
    import {
        AppStyle,
        Baseline as baseline,

        CircleSpinner as Spinner,
    } from "svelte-doric"
    import { TronTheme as theme } from "svelte-doric/theme"

    import Login from "@/comp/login.svelte"
    import Dashboard from "@/comp/dashboard.svelte"

    import user from "@/state/user.mjs"
</script>

<style>
    center-load {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

<AppStyle {baseline} {theme} />

{#if $user === null}
    <center-load>
        <Spinner size={240} />
    </center-load>
{:else if $user === false}
    <Login />
{:else}
    <Dashboard />
{/if}
