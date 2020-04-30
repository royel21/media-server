<script>
  import {
    onMount,
    onDestroy,
    getContext,
    createEventDispatcher
  } from "svelte";
  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import Axios from "Axios";
  import { calRows } from "./Utils";
  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  let page = 1;
  let totalPages = 1;
  let filter = "";
  let fId = "";
  let totalItems = 0;
  let items = [];
  let folder = {};
  let showModal = false;
  let modalType = {};

  const loadFolders = async pg => {
    let resp = await Axios.get(
      `/api/admin/folders/${page}/${calRows()}/${filter || ""}`
    );

    if (resp.data.folders.length > 0) {
      let data = resp.data;

      fId = data.folders[0].Id;
      items = data.folders;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg || 1;
      dispatch("folderid", fId);
    }
  };

  onMount(() => {
    loadFolders(1);
    socket.on("folder-renamed", data => {
      if (data.success) {
        folder.Name = data.Name;
        console.log(items);
        items = items;
        hideModal();
      }
      console.log("rename: ", data.msg);
    });

    socket.on("folder-removed", data => {
      if (data.success) {
        if (page === totalPages && items.length > 1) {
          items = items.filter(f => f.Id !== folder.Id);
        } else {
          page -= 1;
          loadFolders(page);
        }
        hideModal();
      }
      console.log("remove:", data.msg);
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$folder-renamed"];
    delete socket._callbacks["$folder-removed"];
  });

  const onFilter = flt => {
    filter = flt.detail;
    loadFolders(1);
  };

  const gotopage = pg => {
    pg = parseInt(pg.detail);
    if (pg < 1 || pg > totalPages) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;

    loadFolders(pg);
  };

  const itemClick = event => {
    let el = event.target;
    if (el.tagName === "LI") {
      fId = el.id;
      dispatch("folderid", fId);
    } else {
      folder = items.find(f => f.Id === el.closest("li").id);
      let cList = el.classList.toString();
      if (/fa-edit/gi.test(cList)) {
        modalType = { title: "Edit Folder", Del: false };
      } else {
        modalType = { title: "Remove Folder", Del: true };
      }
      showModal = true;
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (modalType.Del) {
      socket.emit("remove-folder", { Id: folder.Id });
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
  {fId}
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={gotopage}
  on:click={itemClick} />
