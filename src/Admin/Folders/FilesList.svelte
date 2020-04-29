<script>
  import {
    onMount,
    onDestroy,
    getContext,
    createEventDispatcher
  } from "svelte";
  import Axios from "Axios";
  import { calRows } from "./Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";

  const dispatch = createEventDispatcher();
  export let fId;

  let page = 1;
  let totalPages;
  let totalItems;
  let filter = "";
  let items = [];
  let file = {};
  let showModal = false;
  let modalType = {};

  let socket = getContext("socket");

  const loadFiles = async folderId => {
    let resp = await Axios.get(
      `api/admin/folders/files/${folderId}/${page}/${calRows(
        ".list-container"
      )}/${filter || ""}`
    );
    if (resp.data.files) {
      let data = resp.data;
      items = data.files;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
    }
  };

  onMount(async () => {
    socket.on("file-removed", data => {
      if (data.removed) {
        dispatch("loadFiles", 1);
      }
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$file-removed"];
  });

  const removeFile = systemDel => {
    socket.emit("remove-file", { Id: localFile.Id, Del: systemDel });
  };

  const onFilter = flt => (filter = flt);

  const goToPage = pg => {
    pg = parseInt(pg.detail);
    if (pg < 1 || pg > totalPages) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFiles(fId);
  };

  $: if (fId) {
    page = 1;
    loadFiles(fId);
  }

  const itemClick = event => {
    let el = event.target;
    if (el.tagName !== "LI") {
      file = items.find(f => f.Id === el.closest("li").id);
      let cList = el.classList.toString();
      if (/fa-edit/gi.test(cList)) {
        modalType = { title: "Edit File", Del: false, isFile: true };
      } else {
        modalType = { title: "Remove File", Del: true, isFile: true };
      }
    }
    showModal = true;
  };

  const handleSubmit = event => {
    event.preventDefault();
  };

  const hideModal = () => {
    showModal = false;
  };
</script>

{#if showModal}
  <Modal {file} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

<ItemList
  title="Files"
  fId=""
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={goToPage}
  on:click={itemClick} />
