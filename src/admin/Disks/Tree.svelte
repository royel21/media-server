<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import TreeItem from "./TreeItem.svelte";
  import DirectoryModal from "./DirectoryModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";
  import { setMessage } from "../Store/MessageStore";
  import FileList from "./FileList.svelte";
  import TreeMenu from "./TreeMenu.svelte";

  const socket = getContext("socket");
  let content = [];
  let showModal = false;
  let item = {};
  let loading = true;
  let treeRef;
  let offset = 0;
  let zIndex = 98;
  let files = [];
  let current = {};
  let showMenu = false;

  const scanDir = (data) => {
    item = data;
    showModal = true;
  };
  const setFiles = (fileContent, cur) => {
    files = fileContent;
    current = cur;
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

  const onCleanupMessage = (message) => setMessage({ error: message.error, msg: message });

  const onMenu = (e, file) => {
    showMenu = { e, file };
  };
  const hideMenu = () => (showMenu = false);

  const onFolderSize = ({ Name, Size }) => {
    setMessage({ msg: `${Size} - ${Name}` });
  };

  socket.on("finish-cleaning", onCleanupMessage);
  socket.on("disk-loaded", onDiskdata);
  socket.on("folder-size", onFolderSize);

  onMount(() => {
    document.body.addEventListener("click", hideMenu);
    setTimeout(() => {
      socket.emit("load-disks");
    }, 50);
  });

  onDestroy(() => {
    document.body.removeEventListener("click", hideMenu);
    socket.off("finish-cleaning", onCleanupMessage);
    socket.off("disk-loaded", onDiskdata);
    socket.off("folder-size", onFolderSize);
  });
</script>

{#if showModal}
  <DirectoryModal {createDirectory} {hideModal} Name={item.Name} />
{/if}

<TreeMenu {showMenu} {scanDir} />

{#if loading}
  <div class="d-loading">
    <Loading />
  </div>
{:else}
  <div class="d-content" class:expanded={files.length}>
    <div class="rows">
      <div class="col" class:no-files={files.length === 0}>
        {#if files.length}
          <span class="files"><Icons name="list" /></span>
        {/if}
        <div class="tree" bind:this={treeRef}>
          <Icons name="hdd" color="black" />
          <span class="tree-name">Server</span>
          <ul class="tree-view usn">
            <TreeItem type="hdd" items={content} {offset} {zIndex} {setFiles} {current} {onMenu} />
          </ul>
        </div>
      </div>
      {#if files.length}
        <FileList {files} {socket} Name={current?.Name} {content} />
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
    position: relative;
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
  .files {
    position: absolute;
    right: 10px;
  }
  @media (pointer: none), (pointer: coarse) and (max-width: 640px) {
    .d-content.expanded {
      min-width: calc(100% * 2 - 10px);
    }
    .tree:not(.no-files) {
      height: 100%;
      overflow-y: auto;
      padding: 0 5px;
    }
  }
</style>
