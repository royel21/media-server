<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";
  import { setMessage } from "../Store/MessageStore";
  import DiskInfo from "./DiskInfo.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};
  let loading = true;
  let treeRef;
  let offset = 0;
  let zIndex = 98;
  let height = 39;
  let first = false;

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
    if (loading) {
      content = data;
      loading = false;
    }
  };

  const onCleanupMessage = (message) => {
    if (message.error) {
      setMessage({ error: true, msg: message.error });
    } else {
      console.log(message);
      setMessage({ msg: message });
    }
  };

  const scrollToTop = () => {
    treeRef.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  socket.on("finish-cleaning", onCleanupMessage);
  socket.on("disk-loaded", onDiskdata);

  onMount(() => {
    setTimeout(() => {
      socket.emit("load-disks");
    }, 50);
  });

  onDestroy(() => {
    socket.off("finish-cleaning", onCleanupMessage);
    socket.off("disk-loaded", onDiskdata);
  });
</script>

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} Name={item.Name} />
{/if}

<DiskInfo {height} {socket} />

<div class="tree-title" style={`height: calc(100% - ${height}px)`} bind:this={treeRef}>
  <Icons name="hdd" />
  <span class="tree-name">Server</span>
  {#if loading}
    <div class="d-loading">
      <Loading />
    </div>
  {:else}
    <ul class="tree-view usn">
      <TreeItem type="hdd" items={content} on:scanDir={scanDir} {scrollToTop} {offset} {zIndex} />
    </ul>
  {/if}
</div>

<style>
  .tree-title {
    height: calc(100% - 39px);
    overflow-y: auto;
    padding-left: 5px;
  }
  .tree-title .tree-name {
    user-select: none;
  }
  ul {
    margin-left: 25px;
    padding-bottom: 5px;
  }
  .d-loading {
    height: calc(100% - 150px);
  }
</style>
