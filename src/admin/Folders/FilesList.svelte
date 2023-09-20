<script>
  import { onMount, getContext } from "svelte";
  import { calRows } from "../Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import apiUtils from "src/apiUtils";
  import { clamp } from "src/ShareComponent/utils";

  const socket = getContext("socket");

  export let folderId;
  let oldFolder = folderId;

  let page = 1;
  let totalPages;
  let totalItems;
  let filter = "";
  let items = [];
  let file = {};
  let showModal = false;
  let modalType = {};

  const loadFiles = async (pg) => {
    if (folderId) {
      let rows = calRows(".list-container");
      let data = await apiUtils.admin(["folders", "files", folderId, pg, rows, encodeURIComponent(filter)]);

      if (data.items) {
        items = data.items;
        totalPages = data.totalPages;
        totalItems = data.totalItems;
        page = pg;
      }
    } else {
      items = [];
      page = 0;
      totalPages = 0;
      totalItems = 0;
    }
  };

  const onFileRename = (data) => {
    if (data.success) {
      file.Name = data.Name;
      items = items;
      hideModal();
    } else {
      modalType.error = data.msg;
    }
  };

  const onFileRemove = (data) => {
    if (data.success) {
      if (items.length === 1 && totalPages > 1) {
        loadFiles(page - 1);
      } else {
        loadFiles(page);
      }

      hideModal();
    } else {
      modalType.error = data.msg;
    }
  };

  const scanFinish = (data) => {
    if (data.Id === folderId) {
      loadFiles(1);
    }
  };

  const socketEvent = [
    { name: "file-renamed", event: onFileRename },
    { name: "file-removed", event: onFileRemove },
    { name: "reload", event: scanFinish },
  ];

  onMount(async () => {
    loadFiles(1);

    socketEvent.forEach(({ name, event }) => socket.on(name, event));
    return () => {
      socketEvent.forEach(({ name, event }) => socket.off(name, event));
    };
  });

  const onFilter = (event) => {
    filter = event.detail;
    loadFiles(1);
  };

  const goToPage = (pg) => {
    pg = clamp(+pg.detail, 1, totalPages);
    if (pg !== page) {
      loadFiles(pg);
    }
  };

  const iconClick = (event) => {
    let el = event.target;

    if (el.tagName === "SPAN") {
      file = items.find((f) => f.Id === el.closest("li").id);
      let cList = el.classList.toString();
      //Edit button was clicked
      if (/edit/gi.test(cList)) {
        modalType = { title: "Edit File", Del: false, isFile: true };
      }
      //Delete button was clicked
      if (/trash/gi.test(cList)) {
        modalType = { title: "Remove File", Del: true, isFile: true };
      }
      showModal = true;
    }
  };

  const handleSubmit = ({ detail }) => {
    if (modalType.Del) {
      let Del = detail.target.querySelector("input").checked;
      socket.emit("remove-file", { Id: file.Id, Del });
    } else {
      if (!file.Name) {
        modalType.error = "Name Can't be empty";
      } else {
        socket.emit("rename-file", { Id: file.Id, Name: file.Name });
      }
    }
  };

  const hideModal = () => {
    showModal = false;
    file = {};
  };

  $: if (folderId !== oldFolder) {
    filter = "";
    loadFiles(1);
  }
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
  {filter}
  {iconClick}
  on:filter={onFilter}
  on:gotopage={goToPage}
/>
