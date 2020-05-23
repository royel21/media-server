<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import axios from "axios";

  import ItemList from "../Folders/ItemList.svelte";
  import Modal from "../Folders/Modal.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";

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
    return parseInt(container.offsetHeight / 66.19) - 1;
  };

  const loadFiles = async (pg) => {
    let { data } = await axios.get(
      `/api/admin/files/${pg}/${calRows()}/${filter || ""}`
    );

    if (data.files) {
      items = data.files;
      totalPages = data.totalPages || 0;
      totalItems = data.totalItems || 0;
      page = pg;
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

  const itemClick = (event) => {
    let el = event.target;
    if (el.tagName === "I") {
      file = items.find((f) => f.Id === el.closest("tr").id);
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

<style>
  .list-container {
    height: calc(100% - 85px);
    overflow-y: auto;
  }
  .file-list {
    padding: 10px 10px 0px 10px;
    height: 100%;
  }
  .controls {
    display: flex;
    justify-content: space-between;
    border: none;
    height: 45px;
  }
  .controls h4 {
    flex-grow: 1;
    width: 100%;
    user-select: none;
  }
  .list-controls {
    margin-top: 5px;
    text-align: center;
    width: 100%;
  }

  i {
    font-size: 20px;
    margin-right: 6px;
  }
</style>

{#if showModal}
  <Modal {file} {modalType} on:submit={handleSubmit} on:click={hideModal} />
{/if}

<div class="file-list col-6">
  <div class="controls">
    <Filter on:filter={onFilter} />
    <h4 class="text-center">{`${totalItems} - Files`}</h4>
  </div>
  <div class="list-container">
    <table class="table table-bordered table-dark">
      <thead>
        <tr>
          <td>Actions</td>
          <td>Name</td>
          <td>Path</td>
        </tr>
      </thead>
      <tbody>
        {#if items.length < 1}
          <tr>
            <td colspan="3">No Files Found</td>
          </tr>
        {:else}
          {#each items as { Id, Name, Type, Folder }}
            <tr id={Id} on:click={itemClick}>
              <td>
                <i class="fas fa-edit" />
                <i class="fas fa-trash-alt" />
              </td>
              <td>{Name}</td>
              <td>{Folder.Path}</td>
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
