<script>
    import { getContext, onDestroy } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import axios from "axios";

    import Config from "./Config.svelte";
    import { ToggleMenu } from "./ToggleMenu";
    import { DirId, updateDirId } from "../User/Stores/DirectoryStore";

    export let navItems;

    const User = getContext("User");
    let directories;
    let route = location.pathname.split("/")[1];

    function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
        let isActive = false;
        if (href === "/" && location.pathname === "/") isActive = true;

        if (href !== "/" && isPartiallyCurrent) {
            isActive = true;
        }

        if (isActive) {
            return { class: "active" };
        }
        return {};
    }
    let menuToggle = false;
    let unSubscribe = ToggleMenu.subscribe((value) => {
        menuToggle = value;
    });
    onDestroy(unSubscribe);

    $: if (["mangas", "videos"].includes(route) && !directories) {
        axios.get("/api/files/dirs/" + route).then(({ data }) => {
            if (data.length) {
                directories = data;
                selected = data[0].Id;
            } else {
                selected = "";
                directories = null;
            }
        });
    }

    let selected = "";
    let unSubscribeDir = DirId.subscribe((value) => {
        selected = value[location.pathname.split("/")[1]];
    });
    onDestroy(unSubscribeDir);

    const selectDir = ({ target: { id } }) => {
        updateDirId(id, route);
    };
</script>

<style>
    #menu {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        justify-content: space-between;
        padding: 0;
        user-select: none;
        background-color: #343a40;
        transition: 0.3s all;
    }
    #menu.hide {
        top: -66px;
    }
    .navbar-nav {
        display: flex;
        justify-content: left;
    }

    .nav-item {
        position: relative;
        font-size: 1.2rem;
    }
    #p-config {
        position: relative;
        color: white;
    }

    label {
        cursor: pointer;
    }
    .down-list {
        display: none;
        position: absolute;
        top: 99.5%;
        left: 0;
        min-width: 100%;
        text-align: left;
        background-color: #317ac4;
        border-radius: 0 0 0.25rem 0.25rem;
    }
    .nav-item:hover ul {
        display: initial;
    }
    .down-list:hover {
        display: initial;
    }
    .down-list li {
        padding: 8px;
        font-size: 16px;
    }

    .down-list li:not(:last-child) {
        border-bottom: 1px solid;
    }
    .down-list li:hover {
        background-color: rgba(0, 0, 0, 0.7);
    }

    .down-list li:last-child:hover {
        border-radius: 0 0 0.25rem 0.25rem;
    }

    .selected {
        background-color: rgba(0, 0, 0, 0.3);
    }
    @media screen and (max-width: 460px) {
        #p-config {
            display: inline-block;
            text-align: center;
            align-self: center;
        }
    }
</style>

<nav id="menu" class="navbar" class:hide={menuToggle}>
    <ul class="navbar-nav">
        {#each navItems as item}
            {#if ['Mangas', 'Videos'].includes(item.title) && directories}
                <li class="nav-item">
                    <Link
                        to={item.path + '/' + (selected || directories[0].Id)}
                        {getProps}>
                        <label>
                            <i class={'fas fa-' + item.class} />
                            {item.title}
                            <ul class="down-list">
                                {#each directories.filter((d) => d.Type === item.title) as { Id, Name }}
                                    <li
                                        class="list-item"
                                        id={Id}
                                        class:selected={Id === selected}
                                        on:click={selectDir}
                                        title={item.title.toLocaleLowerCase()}>
                                        {Name}
                                    </li>
                                {/each}
                            </ul>
                        </label>
                    </Link>
                </li>
            {:else}
                <li class="nav-item">
                    <Link to={item.path} {getProps}>
                        <i class={'fas fa-' + item.class} />
                        {item.title}
                    </Link>
                </li>
            {/if}
        {/each}
    </ul>
    <ul class="navbar-nav">
        <li id="p-config" class="nav-item">
            <Config {User} on:click />
        </li>
    </ul>
</nav>
