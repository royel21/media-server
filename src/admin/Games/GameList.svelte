<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import { onMount } from "svelte";
  import { calRows } from "../Utils";
  export let setInfo = () => {};

  let items = [];

  let page = 1;
  let totalPages = 0;
  let totalItems = 0;
  let filter = "";
  let GameId = "";

  const loadGames = async () => {
    const data = await apiUtils.admin(["games", page, calRows(), filter], "g-list");
    items = data.items || [];
    totalItems = data.totalItems || 0;
    totalPages = data.totalPages || 0;
    setInfo({ detail: items[0] || {} });
    GameId = items[0]?.Id || "";
    console.log(data);
  };

  const gotopage = async (newPage) => {
    page = newPage.detail;
    await loadGames();
  };

  const filterChange = async (e) => {
    filter = e.detail;
    page = 1;
    await loadGames();
  };

  const selectItem = (Id) => {
    GameId = Id;
    setInfo({ detail: items.find((g) => g.Id === Id) || {} });
  };

  const handlerKeydown = (e) => {
    const { currentTarget, keyCode } = e;

    if ([40, 38].includes(keyCode)) {
      let element = currentTarget.querySelector(".active");
      let index = items.findIndex((g) => g.Id === +element.id);
      let next = keyCode === 40 ? index + 1 : index - 1;

      if (next > -1 && next <= items.length - 1) {
        GameId = items[next]?.Id;
        setInfo({ detail: items[next] || {} });
      }
    }

    if ([37, 39].includes(keyCode)) {
      let nextPage = keyCode === 37 ? -1 : 1;
      gotopage({ detail: +page + nextPage });
      e.preventDefault();
    }
  };
  onMount(loadGames);
</script>

<div class={`file-list col-6 ${totalPages === 1 ? "full-list" : ""}`} tabindex="-1">
  <slot name="first-tag" />
  <div class="controls">
    <slot name="btn-controls" />
    <div on:keydown|stopPropagation class="filter">
      <Filter on:filter={filterChange} {filter} />
    </div>
    <h4 class="text-center usn">{totalItems} <strong>- Games</strong></h4>
    <slot name="btn-ctr-last" />
  </div>
  <div class="list-container" on:keydown={handlerKeydown}>
    <ul class="list-group text-dark">
      {#if items.length < 1}
        <li class="list-group-item empty-list">{`Not Game Found`}</li>
      {:else}
        {#each items as { Id, Name }}
          <li
            id={Id}
            class="list-group-item"
            class:active={+GameId === Id}
            on:click={() => selectItem(Id)}
            tabindex="-1"
          >
            {Name}
          </li>
        {/each}
      {/if}
    </ul>
  </div>
  <div class="list-controls">
    <slot name="bottom-ctr" />
    <Pagination {page} {totalPages} on:gotopage={gotopage} />
  </div>
</div>

<style>
  .file-list {
    position: relative;
  }
  .filter {
    width: 100%;
    flex-shrink: 1;
  }
  li {
    position: relative;
    height: 40px;
  }

  .list-container {
    height: calc(100% - 90px);
    overflow-y: hidden;
    background-color: white;
    border-radius: 0.25rem;
  }
  .full-list .list-container {
    height: calc(100% - 55px);
  }
  .controls {
    position: initial;
    display: flex;
    align-items: center;
    padding: 5px 0;
    border: none;
    height: 45px;
  }
  .controls h4 {
    width: 100%;
  }
  .col-6 {
    flex-grow: 1;
    position: relative;
    width: 49%;
    padding: 0 4px;
    height: 100%;
  }
  .list-controls {
    display: flex;
    justify-content: center;
    width: 100%;
    padding-top: 5px;
  }
  .list-group-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-list:only-child {
    text-align: center;
  }
  li {
    cursor: ponter;
  }
  li :global(svg path),
  li :global(svg) {
    pointer-events: none;
  }

  @media screen and (max-width: 700px) {
    .controls h4 strong {
      display: none;
    }
    .controls h4 {
      width: 60px;
      margin: 0 6px;
    }
    .col-6 {
      min-width: 100%;
    }
  }
</style>
