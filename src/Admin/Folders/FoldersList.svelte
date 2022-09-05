<script>
  import { onMount, onDestroy, getContext, createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";
  import { clamp } from "./Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import axios from "axios";
  import { calRows } from "./Utils";
  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  export let page = 1;
  export let filter = "";
  export let folderId;

  let fimage;
  let totalPages = 1;
  let totalItems = 0;
  let items = [];
  let folder = {};
  let showModal = false;
  let modalType = {};
  let showImage;

  const loadFolders = async (pg) => {
    let { data } = await axios.get(`/api/admin/folders/${pg}/${calRows()}/${filter || ""}`);
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

  onMount(() => {
    loadFolders(page);
    socket.on("folder-renamed", (data) => {
      if (data.success) {
        folder.Name = data.Name;
        items = items;
        hideModal();
      }
    });

    socket.on("folder-removed", (data) => {
      if (data.success) {
        loadFolders(page);
        hideModal();
      }
    });

    socket.on("scan-finish", (data) => {
      let liItem = document.body.querySelector(`#${data.id} .fas`);
      if (liItem) liItem.classList.remove("fa-spin");
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$folder-renamed"];
    delete socket._callbacks["$folder-removed"];
    delete socket._callbacks["$scan-finish"];
  });

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
        modalType = { title: "Edit Folder", Del: false };
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
      let Name = event.target.querySelector("input").value;
      if (!Name) {
        modalType.error = "Name Can't be empty";
      } else {
        socket.emit("rename-folder", { Id: folder.Id, Name });
      }
    }
  };

  const hideModal = () => {
    showModal = false;
    folder = {};
  };

  const onShowImage = (e) => {
    if (e.type === "mouseenter") {
      showImage = items.find((i) => i.Id === e.currentTarget.id)?.Cover;
    } else {
      showImage = false;
    }
  };
</script>

{#if showModal}
  <Modal file={folder} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

{#if showImage}
  <div class="thumbnail">
    <img src={showImage} alt="folder" />
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
/>

<style>
  .thumbnail {
    position: absolute;
    right: 18px;
    top: 47px;
    pointer-events: none;
    z-index: 99;
  }
  .thumbnail img {
    width: 160px;
    object-fit: fill;
  }
</style>
