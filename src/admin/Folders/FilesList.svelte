<script>
  import { onMount, getContext } from "svelte";
  import { calRows } from "../Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import apiUtils from "src/apiUtils";
  import { clamp } from "src/ShareComponent/utils";
  import Icons from "src/icons/Icons.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";

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
  let removeList = [];
  let isChecked = false;

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
      removeList = [];
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
      socket.emit("file-work", { action: "removeFile", data: { Id: file.Id ? file.Id : removeList, Del } });
    } else {
      if (file) {
        if (!file.Name) {
          modalType.error = "Name Can't be empty";
        } else {
          socket.emit("file-work", { action: "renameFile", data: { Id: file.Id, Name: file.Name } });
        }
      }
    }
  };

  const onCheck = ({ target }) => {
    const id = target.closest("li").id;
    if (id) {
      if (!removeList.includes(id)) {
        removeList = [...removeList, id];
      } else {
        removeList = removeList.filter((item) => item !== id);
      }
    }
  };

  const validateCheck = () => {
    if (removeList.length === 0) return false;

    for (const item of items) {
      if (!removeList.includes(item.Id)) {
        return false;
      }
    }
    return true;
  };

  const onCheckAll = () => {
    if (validateCheck()) {
      removeList = removeList.filter((item) => !items.find((i) => i.Id === item));
    } else {
      removeList = [...removeList, ...items.filter((item) => !removeList.includes(item.Id)).map((item) => item.Id)];
    }
  };

  const onRemoveSelected = () => {
    showModal = true;
    modalType = { title: "Remove Selected Files", Del: true, isFile: true };
    file = { Name: "Selected Files" };
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
  }
  $: if (removeList && page) isChecked = validateCheck();
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
  {removeList}
  {iconClick}
  on:filter={onFilter}
  on:gotopage={goToPage}
  on:mouseenter={onShowInfo}
  on:mouseleave={onShowInfo}
  on:change={onCheck}
>
  <span id="del-files" slot="btn-controls">
    <CCheckbox on:change={onCheckAll} {isChecked} title="Select All Files" />
    {#if removeList.length}
      <span on:click={onRemoveSelected}>
        <Icons name="trash" box="0 0 420 512" />
      </span>
    {/if}
  </span>
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
  #del-files {
    display: inline-block;
    min-width: fit-content;
    margin: 0 5px;
  }
</style>
