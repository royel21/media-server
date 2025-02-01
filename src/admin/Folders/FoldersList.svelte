<script>
  import { onMount, getContext, createEventDispatcher, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";

  import ItemList from "./ItemList.svelte";
  import { calRows } from "../Utils";
  import apiUtils from "src/apiUtils";
  import { clamp, sortByName } from "src/ShareComponent/utils";
  import Icons from "src/icons/Icons.svelte";
  import CreateFolderModal from "./CreateFolderModal.svelte";
  import ReplaceImage from "./ReplaceImage.svelte";
  import { setMessage } from "../Store/MessageStore";
  import Modal from "./Modal.svelte";
  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  export let page = 1;
  export let filter = "";
  export let dirid;
  export let folderId;
  export let scanning = [];

  let dirs = [];
  let currentDir = dirid || "all";

  let totalPages = 1;
  let totalItems = 0;
  let items = [];
  let folder = {};
  let showModal = false;
  let modalType = {};
  let showImage;
  let fullPathPos = {};
  let createFolder;
  let showGenres = false;
  let showReplace = false;

  let isMounted = true;

  const newFolder = () => (createFolder = true);

  const loadDir = async () => {
    const data = await apiUtils.admin(["folders", "dirs"]);
    if (data?.dirs && isMounted) {
      dirs = data.dirs.sort((a, b) => a.FullPath.localeCompare(b.FullPath));
    }
  };

  const loadFolders = async (pg, dir) => {
    let flt = filter?.replace(/|:|\?|\^|"|\*|<|>|\t|\n/gi, "") || "";
    let data = await apiUtils.admin(["folders", dir || currentDir || "all", pg, calRows(), flt]);

    if (data.items && isMounted) {
      let tmp = data.items[0];
      folderId = tmp?.Id;
      items = data.items.map((d) => ({ ...d, Name: d.Path.split(/\/|\\/g).pop() }));
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg;
      dispatch("folderid", tmp);
      navigate(`/admin/folders/${currentDir}/${pg}/${flt || ""}`);
      showImage = "";
    }
  };

  const onFilter = (flt) => {
    filter = flt.detail;
    loadFolders(1);
  };

  const gotopage = (pg) => {
    pg = parseInt(pg.detail);

    if (pg < 1 || pg > totalPages) return;

    loadFolders(clamp(pg, 1, totalPages));
  };

  const itemClick = ({ target }) => {
    let el = target;
    folderId = el.id || el.closest("li").id;

    if (el.tagName === "LI") {
      folder = items.find((f) => f.Id === folderId);
      dispatch("folderid", folder);
    }
  };
  const iconClick = (e) => {
    let el = e.target;
    folder = items.find((f) => f.Id === el.closest("li").id);
    let cList = el.classList.toString();

    if (/edit/gi.test(cList)) {
      modalType = { title: "Edit Folder Properties", Del: false };
      showModal = true;
    } else if (/trash/gi.test(cList)) {
      modalType = { title: "Remove Folder", Del: true };
      showModal = true;
    } else if (/sync/gi.test(cList)) {
      socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
      document.getElementById(folder.Id);
      scanning = [...scanning, folder.Id];
    }
  };
  const handleSubmit = ({ Id }, Del) => {
    //if we are deleting the file
    if (modalType.Del) {
      socket.emit("file-work", { action: "removeFolder", data: { Id, Del } });
    }
  };

  const hideModal = () => {
    showModal = false;
    folder = {};
  };

  const onShowImage = (e) => {
    const found = items.find((i) => i.Id === e.currentTarget.id);
    showImage = e.type.includes("mouseenter") ? found : false;
  };

  const showPath = (e) => {
    if (showImage) {
      fullPathPos.y = e.pageY - 30;
      if (fullPathPos.y + 100 > window.innerHeight && showImage.Path?.length > 80) {
        fullPathPos.y = e.pageY - 50;
      }
    }
  };

  const reload = () => {
    let isLast = items.length === 1 && totalPages > 1;
    loadFolders(isLast ? page - 1 : page);
  };

  const onFolderRename = (data) => {
    if (data.msg) {
      setMessage(data);
    }

    let index = items.findIndex((f) => f.Id === data.Id);

    if (data.success && index > -1) {
      if (data.Transfer) {
        reload();
      } else {
        items[index] = data.folder;
      }
    }
  };

  const onFolderRemove = (data) => {
    if (data.success && data.Id) {
      setMessage({ msg: `Folder: ${data.Name} was Removed` });
      reload();
      hideModal();
    }
  };

  const handlerKeydown = (e) => {
    const { currentTarget, keyCode } = e;
    if ([40, 38].includes(keyCode)) {
      let element = currentTarget.querySelector(".active");

      const el = element[keyCode === 40 ? "nextElementSibling" : "previousElementSibling"];
      if (el) {
        itemClick({ target: el });
        el.focus();
      }
    }

    if ([37, 39].includes(keyCode)) {
      let nextPage = keyCode === 37 ? -1 : 1;
      gotopage({ detail: +page + nextPage });
      e.preventDefault();
    }
  };

  const scanFinish = (data) => {
    scanning = scanning.filter((f) => f != data.Id);
  };

  const changeDir = ({ target: { value } }) => {
    currentDir = value;
    loadFolders(1, value);
  };

  const scanDir = (e) => {
    if (currentDir != "all") {
      socket.emit("scan-dir", { Id: currentDir });
      setMessage({ msg: `Scanning Directory: ${dirs.find((d) => d.Id === currentDir)?.FullPath}` });
    }
  };

  const scanDirFinish = (data) => {
    if (data.Id) {
      setMessage({ msg: `Scanning Finish: ${dirs.find((d) => d.Id === data.Id)?.FullPath}`, textColor: "cyan" });
    }
  };

  const socketEvents = [
    { name: "folder-renamed", handler: onFolderRename },
    { name: "folder-removed", handler: onFolderRemove },
    { name: "reload", handler: scanFinish },
    { name: "scan-finish", handler: scanDirFinish },
  ];

  onMount(async () => {
    await loadFolders(page);
    await loadDir();
    socketEvents.forEach((e) => socket.on(e.name, e.handler));
  });

  onDestroy(() => {
    isMounted = false;
    apiUtils.cancelQuery();
    socketEvents.forEach((e) => socket.off(e.name, e.handler));
  });

  $: document.title = `Folders/${dirs.find((d) => d.Id === currentDir)?.FullPath || "All"}/${page}/${filter || ""}`;
</script>

{#if showReplace}
  <ReplaceImage hide={() => (showReplace = "")} Id={showReplace} />
{/if}

{#if createFolder}
  <CreateFolderModal hide={() => (createFolder = false)} {socket} />
{/if}

{#if showModal}
  <Modal file={folder} {modalType} acept={handleSubmit} hide={hideModal} />
{/if}

<ItemList
  title="Folders"
  class="col-6"
  {folderId}
  {items}
  {page}
  {totalPages}
  {totalItems}
  {filter}
  {scanning}
  {showGenres}
  {iconClick}
  on:filter={onFilter}
  on:gotopage={gotopage}
  on:click={itemClick}
  on:mouseenter={onShowImage}
  on:mouseleave={onShowImage}
  on:mousemove={showPath}
  on:keydown={handlerKeydown}
>
  <span class="create-folder" slot="btn-controls" on:keydown on:click={newFolder}><Icons name="squareplus" /></span>
  <span class="show-files" slot="btn-ctr-last">
    <span on:keydown on:click={() => (showGenres = !showGenres)} title="Toggle Genres List">
      <Icons name={showGenres ? "eyeslash" : "eye"} box="0 0 612 512" />
    </span>
  </span>
  <div class="path-tag" slot="first-tag" style={`top:${fullPathPos.y}px;`}>
    {#if showImage}
      <span id="f-path">
        {showImage?.Path}
      </span>
    {/if}
  </div>
  <span class="dir-list" slot="bottom-ctr">
    {#if currentDir !== "all"}
      <span class="sync" on:click={scanDir}>
        <Icons name="sync" box="0 0 512 512" />
      </span>
    {/if}
    <span>Dirs: </span>
    <select class="form-control" on:change={changeDir} value={currentDir}>
      <option value="all">All</option>
      {#each dirs as { Id, FullPath }}
        <option value={Id}>{FullPath}</option>
      {/each}</select
    >
  </span>
</ItemList>

{#if showImage && totalItems}
  <div class="thumbnail">
    <img
      src={`/Folder/${showImage.FilesType}/${encodeURIComponent(showImage?.Name)}.jpg?v=${new Date().getTime()}`}
      alt="Cover Not Found"
    />
  </div>
{/if}

<style>
  .create-folder :global(svg) {
    height: 32px;
    width: 43px;
    top: 3px;
  }
  .thumbnail {
    position: absolute;
    right: 10px;
    top: 95px;
    z-index: 99;
    pointer-events: none;
    padding: 0px 1px;
    border-radius: 0.25rem;
    border: 1px solid black;
    background-color: black;
  }
  .thumbnail img {
    max-width: 200px;
    object-fit: contain;
  }

  .dir-list {
    flex-grow: 1;
    display: flex;
    align-items: center;
    background-color: grey;
    padding: 2px 5px;
    margin-right: 5px;
    border-radius: 0.25rem;
  }
  .dir-list select {
    margin-left: 2px;
    padding: 3px;
    height: 27px;
  }
  @media screen and (max-width: 600px) {
    .thumbnail {
      right: 11px;
    }

    .dir-list select {
      font-size: 0.8rem;
    }
    option {
      font-size: 0.5rem;
    }
  }
</style>
