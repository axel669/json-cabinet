<script>
    import {
        Adornment,
        Button,
        Icon,
        Paper,
        Text,
        TextInput,
        TitleBar,
    } from "svelte-doric"
    import { Flex, Grid } from "svelte-doric/layout"
    import { Dialog, Confirm, Prompt } from "svelte-doric/dialog"

    export let updateAccount
    export let account

    let confirm = null
    let prompt = null

    let showNewKey = false
    let keyName = ""
    let keyPrefix = ""

    $: keyNameError = (keyName.trim() === "")
        ? "Key name cannot be blank"
        : ""
    $: keyPrefixError = (keyPrefix.trim() === "")
        ? "Key prefix cannot be blank"
        : ""

    const deactivate = async () => updateAccount("account.deactivate")
    const newkey = () => {
        const name = keyName.trim()
        const prefix = keyPrefix.trim()

        keyName = ""
        keyPrefix = ""
        showNewKey = false

        updateAccount(
            "apikey.add",
            { prefix, name }
        )
    }

    const removeKey = (key, info) =>
        async () => {
            const shouldRemove = await confirm.show({
                title: "Remove Key",
                message: `Remove api key ${info.name}?`
            })

            if (shouldRemove !== true) {
                return
            }

            updateAccount("apikey.remove", { key })
        }

    const copy = (text) => navigator.clipboard.writeText(text)

    const copyID = () => copy(account.clientID)

    const dateFormat = (timestamp) => new Date(timestamp).toLocaleString(
        navigator.languages[0],
        {
            weekday: "long",
            month: "numeric",
            year: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            // dayPeriod: "short",
        }
    )
</script>

<style>
    account-info {
        display: block;
        padding: 4px;
    }

    api-key {
        display: grid;
        grid-template-columns: min-content auto min-content;
    }
    api-key:nth-child(2n) {
        background-color: rgba(128, 128, 128, 0.25);
    }

    api-key-info {
        display: flex;
        flex-direction: column;
    }
    key-sep {
        border-bottom: 2px solid var(--text-normal);
    }
</style>

<Dialog component={Confirm} bind:this={confirm} />
<Dialog component={Prompt} bind:this={prompt} persistent />
<Paper square width="min(100%, 720px)">
    <Flex direction="column" gap="4px">
        <Paper card>
            <TitleBar slot="title">
                Account Information
            </TitleBar>

            <account-info>
                Requests used: {account.used}

                <div>
                    <Button on:tap={copyID} color="secondary" variant="outline">
                        Copy ClientID
                    </Button>
                </div>
            </account-info>
        </Paper>

        <Paper card>
            <TitleBar slot="title">
                API Keys

                <Adornment slot="action">
                    <Button on:tap={() => showNewKey = true}>
                        <Icon name="add" />
                        New Key
                    </Button>
                </Adornment>
            </TitleBar>

            <Flex direction="column">
                {#if showNewKey}
                    <TextInput
                        label="API Key Name"
                        bind:value={keyName}
                        error={keyNameError}
                        extra={keyNameError}
                    />
                    <TextInput
                        label="Prefix"
                        bind:value={keyPrefix}
                        error={keyPrefixError}
                        extra={keyPrefixError}
                    />
                    <Grid cols={2} padding="0px">
                        <Button on:tap={() => showNewKey = false} color="danger">
                            Cancel
                        </Button>
                        <Button on:tap={newkey} color="secondary">
                            Add Key
                        </Button>
                    </Grid>
                    <key-sep />
                {/if}

                {#each Object.entries(account.keys) as [key, info]}
                    <api-key>
                        <Button on:tap={() => copy(key)} color="primary">
                            <Icon name="copy" />
                        </Button>
                        <api-key-info>
                            <Text>{info.name}</Text>
                            <Text variant="secondary">
                                Prefix: {info.prefix}
                            </Text>
                            <Text variant="secondary">
                                Created: {dateFormat(info.created)}
                            </Text>
                        </api-key-info>
                        <Button on:tap={removeKey(key, info)} color="danger">
                            <Icon name="remove" />
                        </Button>
                    </api-key>
                {:else}
                    No API keys made
                {/each}
            </Flex>
        </Paper>
    </Flex>

    <Button on:tap={deactivate} color="danger" slot="action" variant="outline">
        Deactivate
    </Button>
</Paper>
