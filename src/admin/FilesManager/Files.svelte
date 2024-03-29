<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import { navigate } from "svelte-routing";

  import Modal from "../Folders/Modal.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";
  import apiUtils from "../../apiUtils";
  import Icons from "../../icons/Icons.svelte";

  const socket = getContext("socket");
  export let page = 1;
  export let filter = "";

  let totalPages = 0;
  let totalItems = 0;
  let items = [];
  let file = {};
  let showModal = false;
  let modalType = {};

  const calRows = () => {
    let container = document.querySelector(".list-container") || {};
    return parseInt(container.offsetHeight / 45) - 1;
  };

  const loadFiles = async (pg) => {
    const data = await apiUtils.admin(["files", pg, calRows(), filter]);

    if (data.files) {
      items = data.files;
      totalPages = data.totalPages || 0;
      totalItems = data.totalItems || 0;
      page = +pg;
      navigate(`/admin/files/${pg}/${filter || ""}`);
    }
  };

  onMount(async () => {
    loadFiles(1);
    socket.on("file-renamed", (data) => {
      if (data.success) {
        file.Name = data.Name;
        items = items;
        hideModal();
      }
    });

    socket.on("file-removed", (data) => {
      if (data.success) {
        loadFiles(page);
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
    pg = +pg.detail;
    if (pg < 1 || pg > totalPages) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFiles(page);
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
        // modalType = { title: "Remove File", Del: true, isFile: true };
        socket.emit("remove-file", { Id: file.Id, Del: true });
      }
    }
  };

  const handleSubmit = (event) => {
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

<div class="file-list col-6">
  <div class="f-controls">
    <Filter on:filter={onFilter} {filter} />
    <h4 class="text-center usn">{`${totalItems} - Files`}</h4>
  </div>
  <div class="list-container">
    <table class="table table-bordered table-dark">
      <thead>
        <tr>
          <th>Actions</th>
          <th>Name</th>
          <th>Path</th>
        </tr>
      </thead>
      <tbody>
        {#if items.length < 1}
          <tr>
            <td colspan="3">No Files Found</td>
          </tr>
        {:else}
          {#each items as { Id, Name, Path }}
            <tr id={Id} on:click={itemClick}>
              <td>
                <span><Icons name="edit" /></span>
                <span><Icons name="trash" /></span>
              </td>
              <td>{Name}</td>
              <td>{Path}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  <div class="list-controls">
    <Pagination {page} {totalPages} on:gotopage={goToPage} />
  </div>
</div>

<style>
  .list-container {
    height: calc(100% - 85px);
    overflow: auto;
  }

  .file-list {
    padding: 10px 10px 0px 10px;
    height: 100%;
  }
  .f-controls {
    display: flex;
    justify-content: space-between;
    border: none;
    height: 45px;
  }
  .f-controls h4 {
    flex-grow: 1;
    width: 100%;
  }
  .list-controls {
    margin-top: 5px;
    text-align: center;
    width: 100%;
  }
  .table {
    width: 100%;
    min-width: max-content;
  }
</style>
