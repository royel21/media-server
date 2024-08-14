<script>
  import { onDestroy, onMount, getContext, afterUpdate } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";
  import { setMessage } from "../Store/MessageStore";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};
  let loading = true;
  let ref;
  let treeRef;
  let height = 39;
  let showDiskInfo = false;
  let offset = 0;
  let zIndex = 98;

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
    loading = false;
  };

  const onCleanupMessage = (message) => {
    console.log(message);
    setMessage({ msg: message });
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

  afterUpdate(() => {
    height = ref?.offsetHeight || 39;
  });
</script>

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} Name={item.Name} />
{/if}

<div class="d-info" bind:this={ref}>
  <input type="checkbox" name="" id="d-info" bind:checked={showDiskInfo} />
  <h4><label for="d-info">Disk Info {showDiskInfo ? "Hide" : "Show"}</label></h4>
  <table>
    <thead>
      <tr>
        <th class="skip">DisK</th>
        <th>Size</th>
        <th>Free</th>
        <th>Used</th>
      </tr>
    </thead>
    <tbody>
      {#each content as { Name, Free, Used, Size }}
        <tr>
          <td class="skip">{Name}</td>
          <td>{Size}</td>
          <td>{Free}</td>
          <td>{Used}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

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
  .d-info {
    padding: 5px 8px;
    border-bottom: 1px solid;
  }
  table {
    width: 100%;
  }
  .skip {
    white-space: nowrap;
  }
  th:not(.skip),
  td:not(.skip) {
    text-align: right;
  }
  h4 {
    text-align: center;
    border-bottom: 1px solid white;
    user-select: none;
  }
  #d-info {
    display: none;
  }
  #d-info:not(:checked) + h4 + table {
    display: none;
  }
  #d-info:not(:checked) + h4 {
    border-bottom: initial;
  }
</style>
