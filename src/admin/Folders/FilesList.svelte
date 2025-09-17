<script>
  import { onMount, getContext } from "svelte";
  import { calRows, mapFilePath, validateCheck } from "../Utils";

  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";
  import apiUtils from "src/apiUtils";
  import { clamp } from "@share/utils";
  import Icons from "src/icons/Icons.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";
  import BulkEdit from "../Component/BulkEdit.svelte";
  import { setMessage } from "../Store/MessageStore";
  import ZipControls from "../Disks/FolderFiles/ZipControls.svelte";
  import VideoControl from "../Disks/FolderFiles/VideoControl.svelte";

  const socket = getContext("socket");

  export let folderId;
  export let Path;

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
  let showEdit = false;
  let modalType = {};
  let removeList = [];
  let isChecked = false;
  let rows = 0;
  let selectedList = [];

  const dateFormat = { year: "numeric", month: "short", day: "numeric" };

  const mapItem = (item) => {
    const sept = Path?.match(/\\|\//);
    if (sept) {
      item.Path = `${Path}${sept[0]}${item.Name}`;
    }
    return item;
  };

  const loadFiles = async (pg) => {
    if (folderId) {
      rows = calRows("#l-files");
      let data = await apiUtils.admin(["folders", "files", folderId, pg, rows, filter]);

      if (data.items) {
        items = data.items.map(mapItem);
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

  const onRenameFinish = async ({ renFinish }) => {
    if (renFinish) {
      await loadFiles(page);
      setMessage({ msg: "Files Renamed Successfully", color: "green" });
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

  const onBulkEdit = () => {
    if (removeList.length === 1) {
      modalType = { title: "Edit File", Del: false, isFile: true };
      showModal = true;
    } else {
      showEdit = true;
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
    { name: "info", event: onRenameFinish },
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

  const acept = (file, Del) => {
    if (modalType.Del) {
      socket.emit("file-work", { action: "removeDBFile", data: { Id: file.Id ? file.Id : removeList, Del } });
    } else {
      socket.emit("file-work", { action: "renameDBFile", data: { Id: file.Id, Name: file.Name } });
    }
    removeList = [];
    showModal = false;
  };

  const hideBulkRename = () => (showEdit = false);

  const onBulkRename = (params) => {
    socket.emit("file-work", { action: "renameDBFiles", data: { Id: removeList, params } });
    removeList = [];
    hideBulkRename();
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

  const onCheckAll = () => {
    if (validateCheck(removeList, items)) {
      removeList = removeList.filter((item) => !items.find((i) => i.Id === item));
    } else {
      removeList = [...removeList, ...items.filter((item) => !removeList.includes(item.Id)).map((item) => item.Id)];
    }
  };

  const onRemoveSelected = () => {
    modalType = { title: "Remove Selected Files", Del: true, isFile: true };
    selectedList = items.filter((i) => removeList.includes(i.Id));
    showModal = true;
  };

  const hideModal = () => {
    showModal = false;
  };

  const onShowInfo = ({ type, target }) => {
    file = items.find((f) => f?.Id === target?.id);
    showFileinfo = type === "mouseenter";
  };

  let timeout;
  const onResize = () => {
    const newRows = calRows();
    if (rows !== newRows) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadFiles(page);
      }, 300);
    }
  };

  onMount(async () => {
    loadFiles(1);
    window.addEventListener("resize", onResize);
    socketEvent.forEach(({ name, event }) => socket.on(name, event));
    mounted = true;
    return () => {
      window.removeEventListener("resize", onResize);
      socketEvent.forEach(({ name, event }) => socket.off(name, event));
    };
  });

  $: if (mounted && folderId !== oldFolder) {
    filter = "";
    loadFiles(1);
    oldFolder = folderId;
  }
  $: if (removeList && page) isChecked = validateCheck(removeList, items);
  $: if (removeList.length) {
    if (!removeList.length) {
      selectedList = [];
    }
    selectedList.push(...items.filter((i) => removeList.includes(i.Id)));
    console.log("selected", selectedList, removeList);
  }
</script>

{#if showEdit}
  <BulkEdit length={selectedList.length} hide={hideBulkRename} acept={onBulkRename} />
{/if}

{#if showModal}
  <Modal file={selectedList[0]} {modalType} {acept} hide={hideModal} />
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
  on:filter={onFilter}
  on:gotopage={goToPage}
  on:mouseenter={onShowInfo}
  on:mouseleave={onShowInfo}
  on:change={onCheck}
>
  <span id="del-files" slot="btn-controls">
    <CCheckbox on:change={onCheckAll} {isChecked} title="Select All Files" />
    {#if removeList.length}
      <span on:click={onBulkEdit}>
        <Icons name="edit" />
      </span>
      {#if selectedList[0]?.Name.includes(".zip")}
        <ZipControls {selectedList} {socket} />
      {:else}
        <VideoControl {selectedList} {socket} />
      {/if}
      <span on:click={onRemoveSelected}>
        <Icons name="trash" box="0 0 420 512" />
      </span>
    {/if}
  </span>
  <div slot="item-slot" class="f-info" let:item>
    {#if file?.Id === item && showFileinfo}
      <span>{(file.Size / 1024).toFixed(2)}mb</span> -
      <span>{new Date(file.CreatedAt)?.toLocaleDateString("en-us", dateFormat)}</span>
    {/if}
  </div>
</ItemList>

<style>
  .f-info {
    position: absolute;
    top: 10px;
    right: 1px;
    z-index: 401;
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

  #del-files span:not(:first-child) {
    margin: 0 5px;
  }
  #del-files span:nth-child(2) {
    margin-right: 0px;
  }
</style>
