<script>
  import {
    onMount,
    onDestroy,
    getContext,
    createEventDispatcher,
  } from "svelte";
  import axios from "axios";
  import { calRows } from "./Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";

  const dispatch = createEventDispatcher();
  const socket = getContext("socket");

  export let folderId;

  let page = 1;
  let totalPages;
  let totalItems;
  let filter = "";
  let items = [];
  let file = {};
  let showModal = false;
  let modalType = {};

  const loadFiles = async (pg) => {
    let { data } = await axios.get(
      `/api/admin/folders/files/${folderId}/${pg}/${calRows(
        ".list-container"
      )}/${filter || ""}`
    );

    if (data.files) {
      items = data.files;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg;
    }
  };

  onMount(async () => {
    socket.on("file-renamed", (data) => {
      if (data.success) {
        file.Name = data.Name;
        items = items;
        hideModal();
      }
    });

    socket.on("file-removed", (data) => {
      console.log(page, totalPages);
      if (data.success) {
        if (page === totalPages && items.length > 1) {
          items = items.filter((f) => f.Id !== file.Id);
        } else {
          page = page > 1 ? page - 1 : page;
          loadFiles(page);
        }
        hideModal();
      }
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$file-renamed"];
    delete socket._callbacks["$file-removed"];
  });

  const onFilter = (event) => {
    filter = event.detail;
    loadFiles(1);
  };

  const goToPage = (pg) => {
    pg = parseInt(pg.detail);
    if (pg < 1 || pg > totalPages) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFiles(page);
  };

  $: if (folderId) {
    loadFiles(1);
  }

  const itemClick = (event) => {
    let el = event.target;
    if (el.tagName !== "LI") {
      file = items.find((f) => f.Id === el.closest("li").id);
      let cList = el.classList.toString();
      if (/fa-edit/gi.test(cList)) {
        modalType = { title: "Edit File", Del: false, isFile: true };
      } else {
        modalType = { title: "Remove File", Del: true, isFile: true };
      }
      showModal = true;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (modalType.Del) {
      let Del = event.target.querySelector("input").checked;
      socket.emit("remove-file", { Id: file.Id, Del });
    } else {
      let Name = event.target.querySelector("input").value;
      if (!Name) {
        modalType.error = "Name Can't be empty";
      } else {
        socket.emit("rename-file", { Id: file.Id, Name });
      }
    }
  };

  const hideModal = () => {
    showModal = false;
    file = {};
  };
</script>

{#if showModal}
  <Modal {file} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

<ItemList
  title="Files"
  folderId=""
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={goToPage}
  on:click={itemClick} />
