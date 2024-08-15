<script>
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import Confirm from "../Component/Confirm.svelte";
  import MoveModal from "./MoveModal.svelte";
  import { setMessage } from "../Store/MessageStore";
  import RenameModal from "./RenameModal.svelte";
  import ModalPassword from "./ModalPassword.svelte";

  export let items = [];
  export let type;
  export let scrollToTop;
  export let offset;
  export let zIndex;

  let item = {};
  let showMenu = false;
  let showConfirm;
  let showMoveTo = false;
  let showRename = false;
  let showModalPass = false;
  let offsetNext = offset + 1;

  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  const expandFolder = async (event) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);
    if (item.Content.length === 0) {
      const data = await apiUtils.post("admin/directories/Content", { Path: item.Path });
      item.Content = data.data;
      items = items;
    } else {
      item.Content = [];
      items = items;
    }
    items.forEach((it) => {
      if (it.Id !== item.Id) {
        it.Content = [];
      }
    });
  };

  const removeFile = async (file) => {
    const data = await apiUtils.post("admin/directories/remove-file", { Path: file.Path });
    if (data.success) {
      items = items.filter((it) => it.Path !== file.Path);
    }
  };

  const cleanDir = (data) => {
    if (data.folder.Path) {
      socket.emit("file-work", { action: "workVideos", data });
    }
    showModalPass = false;
  };

  const menuActions = (event, id) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);

    const actions = {
      scanDirectory: () => dispatch("scanDir", item),
      cleanupVideos: () => (showModalPass = item),
      removeDFolder: () => (showConfirm = item),
      moveToDir: () => (showMoveTo = item),
      remFolder: () => (showRename = item),
    };

    return actions[id] && actions[id]();
  };

  const hideRename = () => (showRename = false);

  const onRename = ({ folder, Name }) => {
    socket.emit("file-work", { action: "remFolder", data: { folder, Name } });

    const item = items.find((it) => it.Path === folder.Path);
    item.Path = item.Path.replace(item.Name, Name);
    item.Name = Name;
    items = items;
    showRename = false;
  };

  const hideMenu = () => {
    showMenu = false;
  };

  const onMenuClick = ({ target }) => menuActions(showMenu.e, target.id);

  const cancel = () => (showConfirm = false);
  const onRemove = (data) => {
    if (data.Path) {
      socket.emit("file-work", { action: "removeDFolder", data });
      items = items.filter((it) => it.Path !== data.Path);
    }
  };

  const hideMoveTo = () => (showMoveTo = false);
  const confirmMove = (data) => {
    socket.emit("file-work", { action: "moveToDir", data });
  };

  const onFolderMove = ({ error, msg, folder, FolderId }) => {
    if (error) {
      console.log(error);
      return setMessage({ error: true, msg: msg });
    }
    if (items.find((it) => it.Name === folder.Name)) {
      items = items.filter((it) => it.Name !== folder.Name);
      if (FolderId) {
        socket.emit("scan-dir", { Id: FolderId, isFolder: true });
      }
      setMessage({ msg: "Finish Moving Folder: " + folder.Name });
    }
  };

  onMount(() => {
    socket.on("folder-move", onFolderMove);
    document.body.addEventListener("click", hideMenu);
    document.body.addEventListener("contextmenu", hideMenu);
    return () => {
      socket.off("folder-move", onFolderMove);
      document.body.removeEventListener("click", hideMenu);
      document.body.removeEventListener("contextmenu", hideMenu);
    };
  });

  const getStyle = (type, content) => {
    if (type === "hdd") return "";

    if (content.length) return `top: ${offset * 27}px; z-index: ${zIndex--}`;
  };
</script>

{#if showConfirm}
  <Confirm text={showConfirm.Name} acept={onRemove} {cancel} data={showConfirm} />
{/if}

{#if showMoveTo}
  <MoveModal data={showMoveTo} hide={hideMoveTo} acept={confirmMove} />
{/if}

{#if showRename}
  <RenameModal data={showRename} hide={hideRename} acept={onRename} />
{/if}

{#if showModalPass}
  <ModalPassword data={showModalPass} acept={cleanDir} hide={() => (showModalPass = false)} />
{/if}

{#if showMenu && /folder/.test(showMenu.Type)}
  <div id="c-menu" style={`left: ${showMenu.e.pageX + 5}px; top:${showMenu.e.pageY + 10}px`} on:click={onMenuClick}>
    <div id="scanDirectory">Add to Directories</div>
    <div id="remFolder">Rename Folder</div>
    <div id="cleanupVideos">Clean Videos</div>
    <div id="moveToDir">Move To Directory</div>
    <div id="removeDFolder">Delete Folder</div>
  </div>
{/if}

{#each items as { Content, Id, Name, Type, Path }}
  <li
    id={Id}
    class={`tree-item ${Type}`}
    class:spanded={Content?.length}
    on:contextmenu|preventDefault|stopPropagation={(e) => (showMenu = { e, Type })}
  >
    {#if Type === "folder" || type === "hdd"}
      <span
        class="caret"
        style={getStyle(type, Content)}
        class:content={Content?.length}
        class:atop={type === "hdd"}
        on:click={expandFolder}>▶</span
      >
    {:else}
      <span on:click={() => removeFile({ Id, Path })}><Icons name="trash" /></span>
    {/if}
    <span
      class="dir"
      class:atop={type === "hdd"}
      class:content={Content?.length}
      style={getStyle(type, Content)}
      on:click={expandFolder}
    >
      <Icons name={Type || type} />
      {Name}
      <span class:count={Content.length}>Files: {Content.length}</span>
    </span>
    {#if Content.length > 0}
      <ul class="tree-node usn">
        <svelte:self type="folder" items={Content} on:scanDir {scrollToTop} offset={offsetNext} {zIndex} />
      </ul>
      <span class="scroll-top" on:click={scrollToTop}>
        <Icons name="arrowcircleup" />
      </span>
    {/if}
  </li>
{/each}

<style>
  .tree-item {
    position: relative;
    min-height: 30px;
  }
  .tree-item :global(.icon-file),
  .tree-item :global(.icon-trash) {
    width: 20px;
  }
  ul {
    margin-left: 25px;
  }
  .dir {
    user-select: initial;
    position: relative;
    cursor: pointer;
    display: inline-block;
    width: calc(100% - 25px);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dir span {
    display: none;
  }
  .dir:hover {
    text-decoration: underline;
    background-color: #696a6b;
  }
  .dir .count {
    display: inline-block;
    position: absolute;
    background-color: #080808;
    right: 5px;
    top: 0;
    z-index: 300;
    padding: 2px;
    border-radius: 0.25rem;
  }
  .caret {
    display: inline-block;
    position: sticky;
    top: 0;
    left: -25px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    cursor: pointer;
    font-size: 1.1rem;
  }
  .caret.content {
    transform: rotate(90deg);
  }
  .caret:last-child {
    transform: rotate(0);
  }
  .caret:active {
    text-transform: scale(1.2);
  }
  .file .dir:hover:after,
  .file .dir:hover:before {
    display: none;
  }
  .content,
  .atop {
    position: sticky;
    top: 0;
    background-color: #343a40;
    z-index: 99;
  }
  .caret {
    pointer-events: all;
  }

  .file {
    margin: 0;
  }

  #c-menu {
    z-index: 300;
    position: fixed;
    width: max-content;
    background-color: rgb(95, 91, 91);
    cursor: pointer;
    border-radius: 0.25rem;
  }
  #c-menu div {
    padding: 2px 5px;
  }
  #c-menu div:not(:last-child) {
    border-bottom: 1px solid;
  }
  #c-menu div:hover {
    background-color: #add8e647;
  }

  #removeDFolder {
    color: rgb(248, 16, 16);
    font-weight: 700;
  }
  .scroll-top {
    position: fixed;
    left: 20px;
    bottom: 20px;
  }

  .scroll-top :global(.icon-arrowcircleup) {
    width: 35px;
    height: 30px;
  }
</style>
