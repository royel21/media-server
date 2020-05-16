<script>
  import {
    onMount,
    onDestroy,
    getContext,
    createEventDispatcher,
  } from "svelte";
  import { navigate } from "svelte-routing";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import axios from "axios";
  import { calRows } from "./Utils";
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

  const loadFolders = async (pg) => {
    let { data } = await axios.get(
      `/api/admin/folders/${page}/${calRows()}/${filter || ""}`
    );

    // console.log("data", data);
    if (data.folders) {
      let folder2 = data.folders[0];
      folderId = (folder2 && folder2.Id) || "";
      items = data.folders;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg || 1;
      dispatch("folderid", folderId);
      navigate(`/folders/${folderId}/${pg}/${filter || ""}`);
    }
  };

  onMount(() => {
    loadFolders(1);
    socket.on("folder-renamed", (data) => {
      if (data.success) {
        folder.Name = data.Name;
        items = items;
        hideModal();
      }
      console.log("rename: ", data.msg);
    });

    socket.on("folder-removed", (data) => {
      if (data.success) {
        if (page === totalPages && items.length > 1) {
          items = items.filter((f) => f.Id !== folder.Id);
          if (folder.Id === folderId) {
            folderId = items[0].Id;
            dispatch("folderid", folderId);
          }
        } else {
          page = page > 1 ? page - 1 : page;
          loadFolders(page);
        }
        hideModal();
      }
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$folder-renamed"];
    delete socket._callbacks["$folder-removed"];
  });

  const onFilter = (flt) => {
    filter = flt.detail;
    loadFolders(1);
  };

  const gotopage = (pg) => {
    pg = parseInt(pg.detail);
    if (pg < 1 || pg > totalPages) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;

    loadFolders(pg);
  };

  const itemClick = (event) => {
    let el = event.target;
    if (el.tagName === "LI") {
      folderId = el.id;
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
        socket.emit("scan-dir", { Id: folderId, isFolder: true });
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (modalType.Del) {
      socket.emit("remove-folder", folder.Id);
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
</script>

{#if showModal}
  <Modal
    file={folder}
    {modalType}
    on:submit={handleSubmit}
    on:click={hideModal} />
{/if}

<ItemList
  title="Folders"
  {folderId}
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={gotopage}
  on:click={itemClick} />
