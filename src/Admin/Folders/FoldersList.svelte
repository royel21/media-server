<script>
  import { onMount, onDestroy, getContext, createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import { calRows } from "./Utils";
  import { clamp } from "../../User/Pages/Utils";
  import apiUtils from "../../api-utils";
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

  const loadFolders = async (pg) => {
    let data = await apiUtils.admin(["folders", pg, calRows(), filter]);
    if (data.items) {
      let tmp = data.items[0];
      folderId = tmp?.Id;
      items = data.items;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg;
      dispatch("folderid", folderId);
      navigate(`/folders/${pg}/${filter || ""}`);
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

      if (/fa-edit/gi.test(cList)) {
        modalType = { title: "Edit Folder Properties", Del: false };
        showModal = true;
      } else if (/fa-trash-alt/gi.test(cList)) {
        modalType = { title: "Remove Folder", Del: true };
        showModal = true;
      } else {
        socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
        let liItem = document.body.querySelector(`#${folder.Id} .fas`);
        if (liItem) liItem.classList.add("fa-spin");
      }
    }
  };

  const handleSubmit = (event) => {
    //if we are deleting the file
    if (modalType.Del) {
      let Del = event.target.querySelector("input").checked;
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
      fullPathPos.x = e.pageX + 10;
      fullPathPos.y = e.pageY + 10;
    }
  };

  onMount(() => {
    loadFolders(page);
    const onFolderRename = (data) => {
      if (data.success && data.Id) {
        let index = items.findIndex((f) => f.Id === data.Id);
        if (index !== -1) {
          items[index] = data.folder;
        }
        hideModal();
      }
    };

    const onFolderRemove = (data) => {
      if (data.success && data.Id) {
        loadFolders(page);
        hideModal();
      }
    };

    const scanFinish = (data) => {
      document.getElementById(data.Id).querySelector(".fas")?.classList.remove("fa-spin");
    };

    socket.on("folder-renamed", onFolderRename);
    socket.on("folder-removed", onFolderRemove);
    socket.on("reload", scanFinish);
  });

  onDestroy(() => {
    socket.off("folder-renamed", onFolderRename);
    socket.off("folder-removed", onFolderRemove);
    socket.off("reload", scanFinish);
  });
</script>

{#if showModal}
  <Modal file={folder} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

{#if showImage}
  <div class="thumbnail">
    <img src={showImage.Cover} alt="Cover Not Found" />
  </div>
  <span id="f-path" style={`left: ${fullPathPos.x}px; top:${fullPathPos.y}px;`}>{showImage.Path}</span>
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
/>

<style>
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
    width: 180px;
    object-fit: fill;
  }
  #f-path {
    display: inline-block;
    position: fixed;
    z-index: 99;
    background-color: rgb(88, 86, 86);
    font-size: 14px;
    font-weight: 600;
    color: white;
    padding: 1px 4px;
    border-radius: 0.25rem;
    border: 1px solid white;
    pointer-events: none;
  }
  @media screen and (max-width: 600px) {
    .thumbnail {
      right: 11px;
      top: 47px;
    }
    .thumbnail img {
      width: 120px;
    }
  }
</style>
