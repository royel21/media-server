<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import { onMount } from "svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import ModalWatchList from "./ModalWatchList.svelte";
  import { formatSize } from "../../Component/util";
  import RenameModal from "./RenameModal.svelte";
  import { setMessage } from "../../Store/MessageStore";
  import FileTypeIcon from "../../Component/FileTypeIcon.svelte";

  let items = [];
  let filter = "";
  let showPath = null;
  let showWatchList = false;
  let showEdit = "";
  let ref;
  let pager = { page: 1, totalPages: 0, totalItems: 0, items: window.localStorage.getItem("w-items") || 100 };

  const applyFilter = async ({ detail }) => {
    filter = detail;
    pager.page = 1;
    load();
  };

  const onRemove = async ({ currentTarget }) => {
    const id = currentTarget.closest("li").id;
    const found = items.find((d) => d.Id === +id);
    if (found) {
      const result = await apiUtils.admin(["files", "remove-watched-file", found.Id]);
      if (result.valid) {
        items = items.filter((d) => d.Id !== found.Id);
      }
    }
  };
  const changeItems = ({ target: { value } }) => {
    pager.items = +value;
    window.localStorage.setItem("w-items", value);
    load();
  };

  const load = async () => {
    const data = await apiUtils.admin(["files", "get-watched-files", pager.page, pager.items, filter]);

    if (data.files) {
      pager.totalPages = data.totalPages;
      pager.totalItems = data.totalItems;
      items = data.files;
      ref.scroll(0, 0);
    }
  };

  const goToPage = ({ detail }) => {
    pager.page = detail;
    load();
  };

  const hideModal = () => {
    showWatchList = false;
    load();
  };

  const onShowPath = ({ target }) => {
    const found = items.find((d) => d.Id === +target.id);
    if (found) {
      const bb = target.getBoundingClientRect();
      showPath = {
        id: +target.id,
        Path: found.Path,
        y: bb.top - 70,
      };
    } else {
      showPath = null;
    }
  };

  const renameFile = async (file) => {
    const result = await apiUtils.post("admin/files/rename-watched-file", file);
    if (result.Id) {
      let index = items.findIndex((d) => d.Id === +result.Id);
      items[index] = result;
    } else {
      setMessage({ msg: result.error, error: true });
    }
  };

  onMount(async () => {
    load();
  });
</script>

{#if showEdit}
  <RenameModal file={showEdit} hide={() => (showEdit = false)} acept={renameFile} />
{/if}

{#if showWatchList}
  <ModalWatchList hide={hideModal} />
{/if}

{#if showPath}
  <div class="path-tag" style={`top:${showPath.y}px;`}>
    <span id="f-path">
      {showPath.Path || ""}
    </span>
  </div>
{/if}

<div id="tag-list" class="file-list">
  <div class="controls">
    <span class="show-list" on:click={() => (showWatchList = true)}><Icons name="list" box="0 0 512 512" /></span>
    <Filter {filter} on:filter={applyFilter} />
    <span class="bagde">{pager.totalItems}</span>
  </div>
  <div class="list-container" bind:this={ref}>
    <ul class="list-group text-dark" on:mousemove={onShowPath} on:mouseleave={() => (showPath = null)}>
      {#if items.length < 1}
        <li class="list-group-item empty-list">Not Files Found</li>
      {:else}
        {#each items as file}
          <li id={file.Id} class="list-group-item">
            <span on:click={onRemove}><Icons name="trash" /></span>
            <span on:click={() => (showEdit = file)}><Icons name="edit" /></span>
            <FileTypeIcon {file} files={items} />
            <strong>{formatSize(file.Size)}</strong>
            <span>{file.Name}</span>
          </li>
        {/each}
      {/if}
    </ul>
  </div>
  {#if pager.totalPages > 1}
    <div class="w-pager">
      <div class="input-group d-items">
        <span id="d-items" class="input-group-text"><Icons name="list" color="black" box="0 0 512 512" /></span>
        <input type="number" class="form-control" value={pager.items} on:change={changeItems} />
      </div>
      <Pagination page={pager.page} totalPages={pager.totalPages} on:gotopage={goToPage} full={true} />
    </div>
  {/if}
</div>

<style>
  #tag-list {
    display: flex;
    flex-direction: column;
    height: 99.5%;
    padding: 5px;
    padding-bottom: 0px;
  }

  #tag-list .list-container {
    border-radius: 0.25rem;
    margin-bottom: 8px;
    flex-grow: 1;
    height: calc(100% - 80px);
    width: 100%;
    overflow: hidden;
  }

  #tag-list ul {
    height: 100%;
    overflow-y: auto;
    background-color: white;
  }

  #tag-list .controls {
    position: initial;
    display: flex;
    align-items: center;
    padding: 0px 0 4px 0;
    justify-content: initial;
  }
  #tag-list li {
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    min-height: 36px;
  }
  #tag-list li span:last-child {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: calc(100% - 113px);
    pointer-events: none;
  }
  #tag-list .empty-list {
    justify-content: center;
  }
  #tag-list li span:hover {
    cursor: ponter;
  }
  #tag-list li :global(svg) {
    pointer-events: none;
  }
  #tag-list .controls :global(.icon-squareplus) {
    top: 3px;
    left: 5px;
    width: 35px;
    height: 35px;
  }
  #tag-list .show-list {
    margin-right: 8px;
  }
  #tag-list :global(#filter-control) {
    flex-grow: 1;
    max-width: initial;
  }
  #tag-list .bagde {
    text-align: center;
    min-width: max-content;
    margin-left: 5px;
    padding: 3px;
    border-radius: 0.25rem;
    background-color: #2196f3;
  }
  .d-items {
    width: 90px;
  }
  .d-items :global(.icon-list) {
    top: 0;
  }
  .w-pager {
    display: flex;
    justify-content: center;
  }
  strong {
    min-width: 78px;
    margin-right: 5px;
  }
</style>
