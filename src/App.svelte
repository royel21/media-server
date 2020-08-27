<script>
    import { onMount, setContext } from "svelte";
    import { navigate } from "svelte-routing";
    import axios from "axios";
    import { tick } from "svelte";
    import socketClient from "socket.io-client";
    //Pages
    import AdminRoutes from "./Admin/AdminRoutes.svelte";
    import UserRoutes from "./User/UserRoutes.svelte";
    import Login from "./Login.svelte";

    let socket;
    let user = { username: "" };
    let isAuthenticating = true;

    function isPwa() {
        return ["fullscreen", "standalone", "minimal-ui"].some(
            (displayMode) =>
                window.matchMedia("(display-mode: " + displayMode + ")").matches
        );
    }

    onMount(async () => {
        let resp = await axios.get("/api/users");
        if (resp.data.isAutenticated) {
            user = resp.data;
        }
        isAuthenticating = false;
    });

    const logout = async () => {
        user = {};
        navigate("/login", { replace: true });
        if (socket) socket.close();
        if (isPwa()) {
            history.go(-(history.length - 2));
        }
        try {
            axios.get("/api/users/logout");
        } catch (error) {
            console.log(error);
        }
    };

    const logIn = (_user) => {
        user = _user.detail;
        navigate("/", { replace: true });
    };

    // window.addEventListener("beforeunload", () => {
    //   if (socket) socket.close();
    // });

    $: if (user.isAutenticated) {
        socket = socketClient("/");
        setContext("socket", socket);
        setContext("User", user);
        socket.on("error", (error) => {
            console.log(error);
        });
        setContext("logout", logout);
    }
</script>

<div id="root">
    {#if isAuthenticating}
        <div>Loading</div>
    {:else if user.username}
        {#if user.role.includes('Admin')}
            <AdminRoutes on:click={logout} />
        {:else}
            <UserRoutes on:click={logout} />
        {/if}
    {:else}
        <Login on:login={logIn} />
    {/if}
</div>
