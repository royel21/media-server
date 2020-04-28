<script>
  import { Router, Route } from "svelte-routing";
  import { onMount } from "svelte";
  import Axios from "Axios";
  import { tick } from "svelte";
  import socketClient from "socket.io-client";

  import Navbar from "./Component/Navbar.svelte";
  //Pages
  import Home from "./Pages/Home.svelte";
  import Folders from "./Pages/Folders.svelte";
  import Login from "./Pages/Login.svelte";
  import Mangas from "./Pages/Mangas.svelte";
  import Videos from "./Pages/Videos.svelte";
  import Favorites from "./Pages/Favorites.svelte";

  var socket;
  let user = { Name: "" };
  let isAuthenticating = true;
  onMount(async () => {
    let resp = await Axios.get("/api/users");
    if (resp.data.isAutenticated) {
      user = resp.data;
    }
    isAuthenticating = false;
    socket = socketClient("/");
    socket.on("connect", () => {
      console.log("connected");
      socket.emit("message", "testing");
    });
  });
  const logouts = async () => {
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
</script>

<style>

</style>

<div id="root">
  {#if isAuthenticating}
    <div>Loading</div>
  {:else if user.Name}
    <Router>
      <Navbar on:click={logouts} />
      <Route path="/folders" component={Folders} />
      <Route path="/videos" component={Videos} />
      <Route path="/mangas" component={Mangas} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/">
        <Home {socket} />
      </Route>
    </Router>
  {:else}
    <Login on:login={logIn} />
  {/if}
</div>
