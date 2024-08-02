<script>
  import { onDestroy, onMount, getContext, afterUpdate } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};
  let loading = true;
  let ref;
  let height = 39;

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
  socket.on("disk-loaded", onDiskdata);

  onMount(() => {
    setTimeout(() => {
      socket.emit("load-disks");
    }, 50);
  });

  onDestroy(() => {
    socket.off("disk-loaded", onDiskdata);
  });

  afterUpdate(() => {
    height = ref?.offsetHeight || 39;
  });
  $: console.log("content", content);
</script>

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} Name={item.Name} />
{/if}

<div class="d-info" bind:this={ref}>
  <table>
    <thead>
      <tr>
        <th>DisK</th>
        <th>Size</th>
        <th>Free</th>
        <th>Used</th>
      </tr>
    </thead>
    <tbody>
      {#each content as { Name, Free, Used, Size }}
        <tr>
          <td>{Name}</td>
          <td>{Size}</td>
          <td>{Free}</td>
          <td>{Used}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="tree-title" style={`height: calc(100% - ${height}px)`}>
  <Icons name="hdd" />
  <span class="tree-name">Server</span>
  {#if loading}
    <div class="d-loading">
      <Loading />
    </div>
  {:else}
    <ul class="tree-view usn">
      <TreeItem type="hdd" items={content} on:scanDir={scanDir} />
    </ul>
  {/if}
</div>

<style>
  .tree-title {
    height: calc(100% - 39px);
    overflow-y: auto;
    padding: 5px 8px;
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
</style>
