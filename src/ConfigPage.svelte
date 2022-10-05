<script>
  import { onMount, setContext } from "svelte";
  import socketClient from "socket.io-client";
  import Loading from "./ShareComponent/Loading.svelte";

  let socket;
  let user = { username: "" };

  function isPwa() {
    return ["fullscreen", "standalone", "minimal-ui"].some(
      (displayMode) => window.matchMedia("(display-mode: " + displayMode + ")").matches
    );
  }

  const logout = async () => {
    try {
      await fetch("/api/users/logout");

      socket?.close();
      if (isPwa()) {
        history.go(-(history.length - 2));
      } else {
        location.href = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };

  onMount(async () => {
    let data = await fetch("/api/users").then((response) => response.json());
    if (data.isAutenticated) {
      user = data;
    } else {
      location.href = "/login";
    }
  });

  $: if (user.isAutenticated) {
    socket = socketClient("/");
    setContext("socket", socket);
    setContext("User", user);

    socket.off("logout", () => logout());
    socket.on("logout", () => logout());

    setContext("logout", logout);
  }
</script>

{#if user.isAutenticated}
  <slot />
{:else}
  <Loading />
{/if}
