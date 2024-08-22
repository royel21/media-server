<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";
  import { setMessage } from "../Store/MessageStore";
  import FileList from "./FileList.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};
  let loading = true;
  let treeRef;
  let offset = 0;
  let zIndex = 98;
  let files = [];

  const scanDir = ({ detail }) => {
    item = detail;
    showModal = true;
  };
  const setFiles = (fileContent) => {
    files = fileContent;
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

{#if loading}
  <div class="d-loading">
    <Loading />
  </div>
{:else}
  <div class="d-content" class:expanded={files.length}>
    <div class="rows">
      <div class="col" class:no-files={files.length === 0}>
        <div class="tree" bind:this={treeRef}>
          <Icons name="hdd" color="black" />
          <span class="tree-name">Server</span>
          <ul class="tree-view usn">
            <TreeItem type="hdd" items={content} on:scanDir={scanDir} {offset} {zIndex} {setFiles} />
          </ul>
        </div>
      </div>
      {#if files.length}
        <FileList {files} {socket} />
      {/if}
      {#if files.length}
        <span class="scroll-top" on:click={scrollToTop}>
          <Icons name="arrowcircleup" />
        </span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .d-content {
    height: 100%;
    padding-bottom: 5px;
  }
  .d-content.expanded {
    min-width: 760px;
  }
  .d-content .rows {
    position: relative;
    padding: 5px;
    padding: 0px 5px;
  }
  .tree {
    height: 100%;
    overflow-y: auto;
    padding: 0 5px;
    overflow-x: hidden;
  }
  :global(.d-content .col) {
    height: 100%;
    background-color: #535353;
    border-radius: 0.3rem;
    width: 50%;
    overflow: hidden;
  }
  .col:first-child {
    margin-right: 5px;
  }
  .d-content .no-files {
    width: 100%;
    margin-right: 0;
  }

  .rows {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  .tree .tree-name {
    user-select: none;
  }

  ul {
    margin-left: 25px;
    padding-bottom: 5px;
  }
  .d-loading {
    height: calc(100% - 150px);
  }
  .scroll-top {
    position: absolute;
    left: 10px;
    bottom: 6px;
    z-index: 999;
  }

  .scroll-top :global(.icon-arrowcircleup) {
    width: 35px;
    height: 30px;
  }
  @media screen and (max-width: 640px) {
    .d-content.expanded {
      min-width: calc(100% * 2 - 10px);
    }
  }
</style>
