<script>
  import { onMount, setContext } from "svelte";
  import { navigate } from "svelte-routing";
  import socketClient from "socket.io-client";
  //Pages
  import AdminRoutes from "./admin/AdminRoutes.svelte";
  import UserRoutes from "./user/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./apiUtils";

  let socket;
  let user = { username: "" };

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
  });

  const logout = async () => {
    try {
      apiUtils.get(["users", "logout"]);
      navigate("/login", { replace: true, state: "" });
      user = { username: "" };

      socket?.close();

      // updateUser();
      if (isPwa()) history.go(-(history.length - 2));
    } catch (error) {
      console.log(error);
    }
  };

  const logIn = (_user) => {
    user = _user.detail;
    navigate("/" + (user.role.includes("Admin") ? "admin" : ""), { replace: true, state: "" });
  };

  $: if (user.isAutenticated) {
    socket = socketClient("/");
    setContext("socket", socket);
    setContext("User", user);

    socket.io.on("error", (error) => {
      console.log(error);
    });
    socket.off("logout", () => logout());
    socket.on("logout", () => logout());

    setContext("logout", logout);
  }
</script>

{#if user.username}
  {#if user.role.includes("Admin")}
    <AdminRoutes />
  {:else}
    <UserRoutes />
  {/if}
{:else}
  <Login on:login={logIn} />
{/if}
