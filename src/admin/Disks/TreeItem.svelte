<script>
  import { getContext, onMount } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";
  import { sortByName } from "src/ShareComponent/utils";

  export let items = [];
  export let type;
  export let offset;
  export let zIndex;
  export let setFiles;
  export let current;
  export let onMenu;

  let item = {};
  let offsetNext = offset + 1;
  let hasFiles = false;

  const socket = getContext("socket");

  const expandFolder = async (event) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);
    if (item.Type !== "file") {
      if (item.Content.length === 0) {
        const data = await apiUtils.post("admin/directories/Content", { Path: item.Path });
        if (data.data) {
          item.Content = data.data.filter((it) => it.Type !== "file");
          items = items;
          const files = data.data.filter((it) => it.Type === "file");
          hasFiles = files.length;
          setFiles(files, item);
        }
      } else {
        item.Content = [];
        items = items;
        hasFiles = false;
        setFiles([], {});
      }
      items.forEach((it) => {
        if (it.Id !== item.Id) {
          it.Content = [];
        }
      });
    }
  };

  const onShowMenu = (e) => {
    const li = e.target.closest("li") || li;
    const found = items.find((it) => it.Id === li.id);
    if (found) {
      onMenu(e, found);
      item = found;
    }
  };

  const onFolderMove = ({ error, msg, folder, FolderId }) => {
    if (findFile(folder?.Id, msg, error)) {
      items = items.filter((it) => it.Name !== folder.Name);
      if (FolderId) {
        socket.emit("scan-dir", { Id: FolderId, isFolder: true });
      }
      if (item.Id === folder.Id) {
        setFiles([], {});
      }
      setMessage({ msg: "Finish Moving Folder: " + folder.Name });
    }
  };

  const findFile = (Id, msg, error) => {
    const found = items.find((it) => it.Id === Id);
    if (found) {
      if (error) return setMessage({ msg, error });
      setMessage({ msg, error });
      return found;
    }
  };

  const onFolderCreate = ({ folder, folderId, msg, error }) => {
    if (findFile(folderId, msg, error)) {
      item.Content.push(folder);
      item.Content.sort(sortByName);
      items = items;
    }
  };

  const onRename = ({ folder, error, msg, Name }) => {
    const found = findFile(folder.Id, msg, error);
    if (found) {
      found.Path = found.Path.replace(item.Name, Name);
      found.Name = Name;
      items = items;
    }
  };

  const onFolderRemove = ({ error, msg, folder }) => {
    if (findFile(folder.Id, msg, error)) {
      items = items.filter((f) => f.Id !== folder.Id);
      item = null;
    }
  };

  const onInfo = ({ msg, error }) => setMessage({ error, msg });

  onMount(() => {
    socket.on("folder-info", onInfo);
    socket.on("folder-create", onFolderCreate);
    socket.on("folder-rename", onRename);
    socket.on("folder-move", onFolderMove);
    socket.on("folder-remove", onFolderRemove);
    return () => {
      socket.off("folder-info", onInfo);
      socket.off("folder-move", onFolderMove);
      socket.off("folder-rename", onRename);
      socket.off("folder-create", onFolderCreate);
      socket.on("folder-remove", onFolderRemove);
    };
  });

  const getStyle = (type, content) => {
    if (type === "hdd") return "";

    if (content.length) return `top: ${offset * 27 + 1}px; z-index: ${zIndex--}`;
  };
</script>

{#each items as { Content, Id, Name, Type }}
  <li id={Id} class={`tree-item ${Type}`} on:contextmenu|preventDefault|stopPropagation={onShowMenu}>
    <span
      class="caret"
      style={getStyle(type, Content)}
      class:content={Content?.length}
      class:atop={type === "hdd"}
      on:click={expandFolder}>▶</span
    >
    <span
      class="dir"
      class:atop={type === "hdd"}
      class:content={Content?.length}
      style={getStyle(type, Content)}
      title={Name}
      on:click={expandFolder}
    >
      <Icons name={Type || type} color="black" />
      <span class:selected={hasFiles && current.Id === Id}>{Name}</span>
      <span class:count={Content.length} class="f-count">Folders: {Content.length}</span>
    </span>
    {#if Content.length > 0}
      <ul class="tree-node usn">
        <svelte:self
          type="folder"
          items={Content}
          on:scanDir
          offset={offsetNext}
          {zIndex}
          {setFiles}
          {current}
          {onMenu}
        />
      </ul>
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
  li {
    color: black;
  }
  ul {
    margin-left: 25px;
  }
  .dir {
    position: relative;
    cursor: pointer;
    display: inline-block;
    width: calc(100% - 25px);
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: text;
    color: white;
  }
  .dir .selected {
    color: #00fff3;
  }
  .dir .f-count {
    display: none;
  }
  .dir:hover {
    text-decoration: underline;
    background-color: #696a6b;
  }
  .dir .count {
    display: inline-block;
    position: absolute;
    background-color: black;
    right: 5px;
    top: 0;
    z-index: 300;
    padding: 2px;
    border-radius: 0.25rem;
    color: white;
    pointer-events: none;
  }
  .caret {
    display: inline-block;
    position: sticky;
    top: 0;
    left: -25px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    cursor: pointer;
    font-size: 1.1rem;
    color: black;
    user-select: none;
  }
  .caret.content {
    transform: rotate(90deg);
    margin: 0px 2px;
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
    background-color: #535353;
    z-index: 99;
  }
  .caret {
    pointer-events: all;
  }

  .file {
    margin: 0;
  }

  #removeDFolder {
    color: rgb(248, 16, 16);
    font-weight: 700;
  }
  .current {
    background-color: rgb(156, 206, 223);
  }
</style>
