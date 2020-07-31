<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};

  const scanDir = ({ detail }) => {
    item = detail;
    showModal = true;
  };
  const createDirectory = Type => {
    socket.emit("scan-dir", { Path: item.Path, Type });
    hideModal();
  };

  const hideModal = () => {
    showModal = false;
    item = {};
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

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} />
{/if}

<div class="tree-title">
  <i class="fas fa-server" />
  <span class="tree-name">Server</span>
</div>
<ul class="tree-view">
  <TreeItem type="hdd" items={content} on:scanDir={scanDir} />
</ul>
