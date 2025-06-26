<script>
  import { onMount, setContext } from "svelte";
  import socketClient from "socket.io-client";
  import Loading from "./ShareComponent/Loading.svelte";

  let socket;
  export let user = { username: "" };

  function isPwa() {
    return ["fullscreen", "standalone", "minimal-ui"].some(
      (displayMode) => window.matchMedia("(display-mode: " + displayMode + ")").matches
    );
  }

  const logout = async () => {
    try {
      await fetch("/api/users/logout");
    } catch (error) {
      console.log(error);
    }

    socket?.close();
    if (isPwa()) {
      history.go(-(history.length - 1));
      location.reload();
    } else {
      location.href = "/login";
    }
  };

  onMount(async () => {
    if (!user.username) {
      try {
        let data = await fetch("/api/users").then((response) => response.json());
        if (data.isAutenticated) {
          user = data;
        } else {
          logout();
        }
      } catch (error) {
        console.log(error);
      }
    }
    localStorage.setItem("user", user.username);
  });

  $: if (user.username) {
    socket = socketClient("/");

    socket.off("logout", logout);
    socket.on("logout", logout);
    setContext("logout", logout);

    setContext("socket", socket);
    setContext("User", user);
  }
</script>

{#if user.isAutenticated}
  <slot {user} />
{:else}
  <Loading />
{/if}
