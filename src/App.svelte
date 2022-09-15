<script>
  import { onMount, setContext } from "svelte";
  import { navigate } from "svelte-routing";
  import socketClient from "socket.io-client";
  //Pages
  import AdminRoutes from "./Admin/AdminRoutes.svelte";
  import UserRoutes from "./User/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./api-utils";

  let socket;
  let user = { username: "" };
  let isAuthenticating = true;

  function isPwa() {
    return ["fullscreen", "standalone", "minimal-ui"].some(
      (displayMode) => window.matchMedia("(display-mode: " + displayMode + ")").matches
    );
  }

  onMount(async () => {
    let data = await apiUtils.get(["users"]);
    if (data.isAutenticated) {
      user = data;
    }
    isAuthenticating = false;
  });

  const logout = async () => {
    try {
      apiUtils.get(["users", "logout"]);
      navigate("/login", { replace: true });
      user = {};

      socket?.close();

      if (isPwa()) history.go(-(history.length - 2));
    } catch (error) {
      console.log(error);
    }
  };

  const logIn = (_user) => {
    user = _user.detail;
    navigate("/", { replace: true });
  };

  $: if (user.isAutenticated) {
    socket = socketClient("/");
    setContext("socket", socket);
    setContext("User", user);
    socket.io.on("error", (error) => {
      console.log(error);
    });

    socket.on("reload", () => logout());

    setContext("logout", logout);
  }
</script>

<div id="root">
  {#if isAuthenticating}
    <div>Loading</div>
  {:else if user.username}
    {#if user.role.includes("Admin")}
      <AdminRoutes on:click={logout} />
    {:else}
      <UserRoutes on:click={logout} />
    {/if}
  {:else}
    <Login on:login={logIn} />
  {/if}
</div>
