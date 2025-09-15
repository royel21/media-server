<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import { navigate } from "svelte-routing";

  import Modal from "../Folders/Modal.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import { formatSize } from "src/utils";
  import FileTypeIcon from "../Component/FileTypeIcon.svelte";
  import { mapFilePath } from "../Utils";

  const socket = getContext("socket");
  export let page = 1;
  export let filter = "";

  let totalPages = 0;
  let totalItems = 0;
  let currentPage = page || 1;
  let items = [];
  let files = [];
  let file = {};
  let showModal = false;
  let modalType = {};
  let rows;
  let isMounted = true;

  const calRows = () => {
    let container = document.querySelector(".list-container") || {};
    const tr = document.querySelector("tbody tr") || {};
    return parseInt(container.offsetHeight / (tr.offsetHeight || 45)) - 1;
  };

  const loadFiles = async (pg) => {
    rows = calRows();
    const data = await apiUtils.admin(["files", pg, rows, filter]);

    if (data.files && isMounted) {
      items = data.files;
      files = data.files.map(mapFilePath);
      totalPages = data.totalPages || 0;
      totalItems = data.totalItems || 0;
      currentPage = +pg;
      navigate(`/admin/files/${pg || 1}/${filter || ""}`);
    }
  };

  const onFileRename = (data) => {
    if (data.success) {
      file.Name = data.Name;
      items = items;
      hideModal();
    }
  };

  const onFileRemoved = (data) => {
    if (data.success) {
      loadFiles(currentPage);
      hideModal();
    }
  };

  onMount(async () => {
    loadFiles(1);
    socket.on("file-renamed", onFileRename);

    socket.on("file-removed", onFileRemoved);
  });

  onDestroy(() => {
    isMounted = false;
    apiUtils.cancelQuery();
    delete socket.off("file-renamed", onFileRename);
    delete socket.off("file-removed", onFileRemoved);
  });

  const onFilter = (event) => {
    filter = event.detail;
    loadFiles(1);
  };

  const goToPage = (pg) => {
    pg = +pg.detail;
    if (pg < 1 || pg > totalPages) return;
    currentPage = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFiles(currentPage);
  };

  const itemClick = (event) => {
    let el = event.target;
    if (el.tagName === "svg") {
      file = items.find((f) => f.Id === el.closest("tr").id);
      let cList = el.classList.toString();
      if (/icon-edit/gi.test(cList)) {
        modalType = { title: "Edit File", Del: false, isFile: true };
        showModal = true;
      } else {
        socket.emit("file-work", { action: "removeFile", data: { Id: file.Id, Del: true } });
      }
    }
  };

  const handleSubmit = (file, Del) => {
    if (modalType.Del) {
      socket.emit("file-work", { action: "removeDBFile", data: { Id: file.Id, Del } });
    } else {
      socket.emit("file-work", { action: "renameDBFile", data: { Id: file.Id, Name: file.Name } });
    }
  };

  const hideModal = () => {
    showModal = false;
    file = {};
  };
  document.title = "Files";
</script>

{#if showModal}
  <Modal {file} {modalType} acept={handleSubmit} hide={hideModal} />
{/if}

<div class="file-list col-6">
  <div class="f-controls">
    <Filter on:filter={onFilter} {filter} />
    <h4 class="text-center usn">{`${totalItems} - Files`}</h4>
  </div>
  <div class="list-container">
    <table class="table table-bordered table-dark">
      <thead>
        <tr>
          <th>No.</th>
          <th>Actions</th>
          <th>Name</th>
          <th>Path</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {#if items.length < 1}
          <tr>
            <td colspan="4">No Files Found</td>
          </tr>
        {:else}
          {#each items as file, i}
            <tr id={file.Id} on:click={itemClick}>
              <td>{(currentPage - 1) * rows + i + 1}</td>
              <td>
                <span><Icons name="edit" /></span>
                <span><Icons name="trash" /></span>
                <FileTypeIcon file={mapFilePath(file)} {files} />
              </td>
              <td>{file.Name}</td>
              <td>{file.Path}</td>
              <td>{formatSize(file.Size)}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  <div class="list-controls">
    <Pagination page={currentPage} {totalPages} on:gotopage={goToPage} />
  </div>
</div>

<style>
  .list-container {
    height: calc(100% - 70px);
    margin-bottom: 5px;
    overflow-x: auto;
  }
  .list-container :global(.input-control) {
    margin: 0;
  }

  .file-list {
    padding: 10px 10px 0px 10px;
    height: 100%;
  }
  .f-controls {
    display: flex;
    justify-content: space-between;
    border: none;
    height: 37px;
  }
  .f-controls h4 {
    flex-grow: 1;
    width: 100%;
  }
  .list-controls {
    text-align: center;
    width: 100%;
  }
  .table {
    width: 100%;
    min-width: max-content;
  }

  .table tr > *:first-child {
    width: 50px;
    min-width: 50px;
  }
  .table tr > *:nth-child(2) {
    text-align: center;
    width: 105px;
    min-width: 105px;
  }
  .table tr > *:nth-child(3) {
    min-width: 150px;
    white-space: nowrap;
  }
</style>
