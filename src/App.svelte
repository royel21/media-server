<script>
  import { onMount, setContext } from "svelte";
  import Axios from "Axios";
  import { tick } from "svelte";
  import socketClient from "socket.io-client";
  //Pages
  import AdminRoutes from "./Admin/AdminRoutes.svelte";
  import UserRoutes from "./User/UserRoutes.svelte";
  import Login from "./Login.svelte";

  var socket;
  let user = { username: "" };
  let isAuthenticating = true;

  onMount(async () => {
    let resp = await Axios.get("/api/users");
    if (resp.data.isAutenticated) {
      user = resp.data;
    }
    isAuthenticating = false;
  });

  const logout = async () => {
    Axios.get("/api/users/logout").then(({ data }) => {
      if (data.success) {
        user = {};
      }
    });
  };
  const logIn = _user => {
    user = _user.detail;
  };

  window.addEventListener("beforeunload", () => {
    if (socket) socket.close();
  });

  socket = socketClient("/");
  socket.on("connect", () => {
    console.log("connected");
    socket.emit("message", "testing");
  });
  setContext("socket", socket);
</script>

<div id="root">
  {#if isAuthenticating}
    <div>Loading</div>
  {:else if user.username}
    {#if user.role.includes('Admin')}
      <AdminRoutes {socket} on:click={logout} />
    {:else}
      <UserRoutes {socket} on:click={logout} />
    {/if}
  {:else}
    <Login on:login={logIn} />
  {/if}
</div>
