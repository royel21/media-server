<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  const socket = getContext("socket");
  let content = [];

  const scanDir = event => {
    socket.emit("scan-dir", { Path: event.detail.Path });
  };

  onMount(() => {
    socket.on("disk-loaded", data => {
      content = data;
    });
    socket.emit("load-disks");
  });
  onDestroy(() => {
    delete socket._callbacks["$disk-loaded"];
  });
</script>

<style>
  ul {
    margin-left: 40px;
    user-select: none;
    padding-bottom: 5px;
  }
</style>

<div class="tree-title">
  <i class="fas fa-server" />
  <span class="tree-name">Server</span>
</div>
<ul class="tree-view">
  <TreeItem type="hdd" items={content} on:scanDir={scanDir} />
</ul>
