<script>
  import { onMount, setContext } from "svelte";
  import socketClient from "socket.io-client";
  import Loading from "./ShareComponent/Loading.svelte";

  let socket;
  export let user = { username: "" };

  const logout = async () => {
    try {
      await fetch("/api/users/logout");
    } catch (error) {
      console.log(error);
    }

    socket?.close();
    location.href = "/";
  };

  onMount(async () => {
    try {
      let data = await fetch("/api/users").then((response) => response.json());
      if (data.isAutenticated) {
        user = data;
      } else {
        location.href = "/login";
      }
    } catch (error) {
      console.log("configPage-error", error);
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
  <slot {user} />
{:else}
  <Loading />
{/if}
