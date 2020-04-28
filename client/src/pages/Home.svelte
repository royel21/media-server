<script>
  import { onMount, onDestroy } from "svelte";
  export let socket;
  let message = "none";

  socket.on("result", data => {
    message = data.r;
    console.log("result - home", data);
  });

  onMount(async () => {
    socket.emit("message", "from home");
  });

  onDestroy(() => {
    if (socket._callbacks["$result"]) {
      delete socket._callbacks["$result"];
    }
  });
</script>

<div>Home Page {message}</div>
