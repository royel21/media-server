<script>
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import ModalWatchList from "./ModalWatchList.svelte";
  import { formatSize } from "./util";
  import RenameModal from "./RenameModal.svelte";
  import FileTypeIcon from "./FileTypeIcon.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { setMessage } from "../Store/MessageStore";

  let show = false;
  let update = false;
  let canShow = tabRex.test(location.pathname);
  const tabRex = /configs|downloads|content-manager/;

  let items = [];
  let filter = "";
  let showPath = null;
  let showWatchList = false;
  let showEdit = "";
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
        y: bb.top + 40,
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

  const hide = () => (show = false);

  const onShowList = () => {
    if (!show) {
      show = true;
      load();
    }
  };

  const onNavigate = ({ currentTarget: { currentEntry } }) => {
    canShow = tabRex.test(currentEntry.url);
  };

  onMount(() => {
    navigation.addEventListener("navigate", onNavigate);
    return () => {
      navigation.removeEventListener("navigate", onNavigate);
    };
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

<span class="show-flist" on:click={onShowList} class:hidden={!canShow}>
  <Icons name="search" />
</span>

{#if show}
  <div class="diag-files">
    <Dialog cancel={hide} acept="" canDrag={true}>
      <div class="controls" slot="modal-header">
        <span class="show-list" on:click={() => (showWatchList = true)}><Icons name="list" box="0 0 512 512" /></span>
        <Filter on:filter={applyFilter} />
        <div class="right-controls">
          <span class="bagde">{pager.totalItems}</span>
          <span class="hide-list" on:click={hide}>
            <Icons name="times" color="white" />
          </span>
        </div>
      </div>
      <div id="tag-list" class="file-list" slot="modal-footer">
        <div class="list-container" class:full={pager.totalPages < 2}>
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
    </Dialog>
  </div>
{/if}

<style>
  .diag-files {
    position: relative;
    z-index: 991;
  }
  .controls {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
  }
  .controls > span {
    margin: 0 4px;
  }
  .controls > span:first-child {
    margin: 0 5px;
    background: rgba(0, 123, 255, 0.95);
    padding: 1px 3px;
    border-radius: 0.25rem;
  }
  .controls :global(#filter-control) {
    flex-grow: 1;
    max-width: initial;
  }
  .right-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 5px;
  }
  .show-flist {
    position: absolute;
    background: rgba(0, 123, 255, 0.95);
    z-index: 99;
    left: 12px;
    top: 54px;
    padding: 2px 4px;
    border-radius: 0.25rem;
  }
  .show-flist :global(svg) {
    right: -2px;
  }
  .hide-list {
    height: 26px;
    width: 26px;
    margin-left: 5px;
    background-color: white;
    border-radius: 0.25rem;
  }
  .hide-list :global(svg) {
    top: 2px;
    right: -6px;
  }
  .diag-files :global(.modal) {
    height: 500px;
    max-width: 500px;
    width: 90%;
  }
  #tag-list {
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100% - 38px);
    padding: 5px;
    padding-bottom: 0px;
  }

  #tag-list .list-container {
    border-radius: 0.25rem;
    margin-bottom: 8px;
    flex-grow: 1;
    max-height: calc(100% - 45px);
    width: 100%;
    overflow: hidden;
  }
  #tag-list .full {
    max-height: calc(100% - 5px);
  }

  #tag-list ul {
    height: 100%;
    overflow-y: auto;
    background-color: white;
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
  .bagde {
    text-align: center;
    min-width: max-content;
    margin-left: 5px;
    padding: 2px 3px;
    border-radius: 0.25rem;
    background-color: #2196f3;
    min-width: 30px;
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
    align-items: center;
  }
  strong {
    min-width: 78px;
    margin-right: 5px;
  }
</style>
