<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};

  const scanDir = ({ detail }) => {
    item = detail;
    showModal = true;
  };
  const createDirectory = (Type, IsAdult) => {
    socket.emit("scan-dir", { Path: item.Path, Type, IsAdult });
    hideModal();
  };

  const hideModal = () => {
    showModal = false;
    item = {};
  };
  const onDiskdata = (data) => {
    content = data;
  };
  socket.on("disk-loaded", onDiskdata);

  onMount(() => {
    socket.emit("load-disks");
  });

  onDestroy(() => {
    socket.off("disk-loaded", onDiskdata);
  });
</script>

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} Name={item.Name} />
{/if}

<div class="tree-title">
  <Icons name="hdd" />
  <span class="tree-name">Server</span>
</div>
<ul class="tree-view usn">
  <TreeItem type="hdd" items={content} on:scanDir={scanDir} />
</ul>

<style>
  ul {
    margin-left: 40px;
    padding-bottom: 5px;
  }
</style>
