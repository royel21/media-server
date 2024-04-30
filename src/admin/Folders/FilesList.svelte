<script>
  import { onMount, getContext } from "svelte";
  import { calRows } from "../Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import apiUtils from "src/apiUtils";
  import { clamp } from "src/ShareComponent/utils";

  const socket = getContext("socket");

  export let folderId;
  let oldFolder;
  let mounted = false;

  let page = 1;
  let totalPages;
  let totalItems;
  let filter = "";
  let items = [];
  let file = {};
  let showModal = false;
  let showFileinfo = false;
  let modalType = {};
  const dateFormat = { year: "numeric", month: "short", day: "numeric" };

  const loadFiles = async (pg) => {
    if (folderId) {
      let rows = calRows("#l-files");
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
    if (data.success && data?.Name) {
      const f = items.find((f) => f.Name === data.Name);
      if (f) f.Name = data.Name;
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

  const onShowInfo = ({ type, target }) => {
    file = items.find((f) => f?.Id === target?.id);
    showFileinfo = type === "mouseenter";
  };

  onMount(async () => {
    loadFiles(1);
    document.body.addEventListener("mouseleave", onShowInfo);
    socketEvent.forEach(({ name, event }) => socket.on(name, event));
    mounted = true;
    return () => {
      document.body.removeEventListener("mouseleave", onShowInfo);
      socketEvent.forEach(({ name, event }) => socket.off(name, event));
    };
  });

  $: if (mounted && folderId !== oldFolder) {
    filter = "";
    loadFiles(1);
    oldFolder = folderId;
    console.log("folder:", folderId);
  }
</script>

{#if showModal}
  <Modal {file} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

<ItemList
  title="Files"
  id="l-files"
  folderId=""
  {items}
  {page}
  {totalPages}
  {totalItems}
  {filter}
  {iconClick}
  on:filter={onFilter}
  on:gotopage={goToPage}
  on:mouseenter={onShowInfo}
  on:mouseleave={onShowInfo}
>
  <div slot="item-slot" class="f-info" let:item>
    {#if file?.Id === item && showFileinfo}
      <span>{(file.Size / 1024 / 1024).toFixed(2)}mb</span> -
      <span>{new Date(file.CreatedAt)?.toLocaleDateString("en-us", dateFormat)}</span>
    {/if}
  </div>
</ItemList>

<style>
  .f-info {
    position: absolute;
    top: 10px;
    right: 1px;
    z-index: 999;
    padding: 0px 4px;
    border-radius: 0.25rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    pointer-events: none;
  }
</style>
