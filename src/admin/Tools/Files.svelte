<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import { onMount } from "svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import ModalWatchList from "./ModalWatchList.svelte";
  import { formatSize } from "../Component/util";

  let items = [];
  let filter = "";
  let showPath = null;
  let showWatchList = false;
  let ref;
  let pager = { page: 1, totalPages: 0, totalitems: 0, items: window.localStorage.getItem("w-items") || 100 };

  const applyFilter = async ({ detail }) => {
    filter = detail;
    load();
  };
  const onRemove = async ({ currentTarget }) => {
    const id = currentTarget.closest("li").id;
    const found = items.find((d) => d.Id === +id);
    if (found) {
      const result = await apiUtils.admin(["files", "remove-watched-file", found.Id]);
      console.log(result);
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

  onMount(async () => {
    load();
  });
</script>

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
        <li class="list-group-item empty-list">Not Tags Found</li>
      {:else}
        {#each items as item}
          <li id={item.Id} class="list-group-item" class:f-path={showPath?.id === item.Id}>
            <span on:click={onRemove}><Icons name="trash" /></span>
            <strong>{formatSize(item.Size)}GB</strong>
            {item.Name}
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
    height: calc(100% - 10px);
  }

  #tag-list .list-container {
    overflow-y: auto;
    background-color: white;
    border-radius: 5px;
    margin-bottom: 8px;
  }
  #tag-list li {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0;
  }
  #tag-list .controls {
    position: initial;
    display: flex;
    align-items: center;
    padding: 0px 0 4px 0;
    justify-content: initial;
  }
  #tag-list .list-group-item {
    position: relative;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    padding: 4px;
  }
  #tag-list .empty-list:only-child {
    text-align: center;
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
    margin-left: 5px;
    padding: 5px;
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
    margin-right: 5px;
  }
</style>
