<script>
  import { onMount, getContext, createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import { calRows } from "./Utils";
  import apiUtils from "../../apiUtils";
  import { clamp } from "../../ShareComponent/utils";
  import Icons from "../../icons/Icons.svelte";
  import CreateFolderModal from "./CreateFolderModal.svelte";
  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  export let page = 1;
  export let filter = "";
  export let folderId;

  let totalPages = 1;
  let totalItems = 0;
  let items = [];
  let folder = {};
  let showModal = false;
  let modalType = {};
  let showImage;
  let fullPathPos = {};
  let createFolder;

  const newFolder = () => (createFolder = true);

  const loadFolders = async (pg) => {
    let flt = encodeURIComponent((filter || "")?.replace(/|:|\?|\^|"|\*|<|>|\t|\n/gi, ""));
    let data = await apiUtils.admin(["folders", pg, calRows(), flt]);

    if (data.items) {
      let tmp = data.items[0];
      folderId = tmp?.Id;
      items = data.items.map((d) => ({ ...d, Name: d.Path.split(/\/|\\/g).pop() }));
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg;
      dispatch("folderid", folderId);
      navigate(`/admin/folders/${pg}/${flt || ""}`);
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
      dispatch("folderid", folderId);
    } else {
      folder = items.find((f) => f.Id === el.closest("li").id);
      let cList = el.classList.toString();

      if (/icon-edit/gi.test(cList)) {
        modalType = { title: "Edit Folder Properties", Del: false };
        showModal = true;
      } else if (/icon-trash/gi.test(cList)) {
        modalType = { title: "Remove Folder", Del: true };
        showModal = true;
      } else {
        socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
        document.getElementById(folder.Id).querySelector(".icon-sync")?.classList.add("icon-spin");
      }
    }
  };

  const handleSubmit = ({ detail }) => {
    //if we are deleting the file
    if (modalType.Del) {
      let Del = detail.target.querySelector("input").checked;
      socket.emit("remove-folder", { Id: folder.Id, Del });
    } else {
      if (!folder.Name) {
        modalType.error = "Name Can't be empty";
      } else {
        socket.emit("rename-folder", folder);
      }
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
    }
  };

  const onFolderRename = (data) => {
    if (data.success && data.Id && data.folder) {
      let index = items.findIndex((f) => f.Id === data.Id);
      if (index !== -1) {
        items[index] = data.folder;
      }
      hideModal();
    }
  };

  const onFolderRemove = (data) => {
    if (data.success && data.Id) {
      if (items.length === 1 && totalPages > 1) {
        loadFolders(page - 1);
      } else {
        loadFolders(page);
      }

      hideModal();
    }
  };

  const scanFinish = (data) => {
    document.getElementById(data.Id).querySelector(".icon-sync")?.classList.remove("icon-spin");
  };

  onMount(() => {
    loadFolders(page);

    socket.on("folder-renamed", onFolderRename);
    socket.on("folder-removed", onFolderRemove);
    socket.on("reload", scanFinish);
    return () => {
      socket.off("folder-renamed", onFolderRename);
      socket.off("folder-removed", onFolderRemove);
      socket.off("reload", scanFinish);
    };
  });
</script>

{#if createFolder}
  <CreateFolderModal hide={() => (createFolder = false)} {socket} />
{/if}

{#if showModal}
  <Modal file={folder} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

{#if showImage}
  <div class="thumbnail">
    <img src={`/Folder/${encodeURIComponent(showImage?.Name)}.jpg`} alt="Cover Not Found" />
  </div>
{/if}

<ItemList
  title="Folders"
  {folderId}
  {items}
  {page}
  {totalPages}
  {totalItems}
  {filter}
  {onShowImage}
  on:filter={onFilter}
  on:gotopage={gotopage}
  on:click={itemClick}
  on:mouseenter={onShowImage}
  on:mouseleave={onShowImage}
  on:mousemove={showPath}
>
  <span class="create-folder" slot="btn-controls" on:click={newFolder}><Icons name="squareplus" /></span>
  <div class="path-tag" slot="first-tag">
    {#if showImage}
      <span id="f-path" style={`top:${fullPathPos.y}px;`}>
        {showImage?.Path}
      </span>
    {/if}
  </div>
</ItemList>

<style>
  .create-folder :global(svg) {
    height: 35px;
    width: 43px;
    top: -1px;
  }
  .path-tag {
    position: relative;
    width: 100%;
  }
  .thumbnail {
    position: absolute;
    right: 18px;
    top: 47px;
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
  #f-path {
    display: inline-block;
    position: absolute;
    z-index: 99;
    background-color: rgb(88, 86, 86);
    font-size: 14px;
    font-weight: 600;
    color: white;
    padding: 1px 4px;
    border-radius: 0.25rem;
    border: 1px solid white;
    pointer-events: none;
    left: 2px;
    width: 99%;
  }
  @media screen and (max-width: 600px) {
    .thumbnail {
      right: 11px;
      top: 47px;
    }
  }
</style>
