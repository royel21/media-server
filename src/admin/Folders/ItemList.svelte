<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";
  export let id;
  export let filter;
  export let title;
  export let items;
  export let folderId;
  export let page = 1;
  export let totalPages = 0;
  export let totalItems = 0;
  export let scanning = [];
  export let showGenres = false;
  export let iconClick;
  export let removeList = [];
  let clazz = "";
  export { clazz as class };

  const addGenres = ({ target }) => {
    let Id = target.closest("li").id;
    apiUtils.admin(["folders", "changes-genres", Id, target.textContent]);
  };
  const addRaw = ({ target }) => {
    let Id = target.closest("li").id;
    apiUtils.admin(["folders", "folder-raw", Id]);
  };
</script>

<div class={"file-list " + clazz}>
  <slot name="first-tag" />
  <div class="controls">
    <slot name="btn-controls" />
    <Filter on:filter {filter} />
    <h4 class="text-center usn">{totalItems} <strong>- {title}</strong></h4>
    <slot name="btn-ctr-last" />
  </div>
  <div class="list-container" {id} on:keydown>
    <ul class="list-group text-dark">
      {#if items.length < 1}
        <li class="list-group-item empty-list">{`Not ${title} Found`}</li>
      {:else}
        {#each items as { Id, Name, Type, Status, FilesType, Scanning }}
          <li
            id={Id}
            class="list-group-item"
            class:active={folderId === Id}
            class:completed={Status}
            on:click
            on:mouseenter
            on:mouseleave
            on:mousemove
            tabindex="-1"
          >
            {#if Type.includes("Folder")}
              <span class="sync" on:click={iconClick}>
                <Icons name="sync" box="0 0 512 512" class={scanning.includes(Id) || Scanning ? "icon-spin" : ""} />
              </span>
              {#if showGenres}
                <span class="g-list">
                  {#if /manga/.test(FilesType)}
                    <span on:click={addGenres}>Mg</span>
                    <span on:click={addGenres}>Mhw</span>
                    <span on:click={addGenres}>Web</span>
                    <span on:click={addRaw}>Raw</span>
                  {:else}
                    <span on:click={addGenres}>sort</span>
                  {/if}
                </span>
              {/if}
            {:else}
              <CCheckbox on:change isChecked={removeList.includes(Id)} />
              <span class="edit" on:click={iconClick}><Icons name="edit" /></span>
            {/if}
            <span class="trash" on:click={iconClick}><Icons name="trash" box="0 0 420 512" /></span>
            {Name}
            <slot name="item-slot" item={Id} />
          </li>
        {/each}
      {/if}
    </ul>
  </div>
  <div class="list-controls">
    <slot name="bottom-ctr" />
    <Pagination {page} {totalPages} on:gotopage />
  </div>
</div>

<style>
  li {
    position: relative;
  }
  .g-list {
    position: absolute;
    right: 5px;
  }
  .g-list span {
    display: inline-block;
    background-color: darkgray;
    color: white;
    padding: 2px 4px;
    border-radius: 0.25rem;
    cursor: pointer;
    max-width: 75px;
    max-height: 26px;
    overflow: hidden;
  }

  .g-list span:active {
    font-size: 1.02rem;
  }

  .list-container {
    height: calc(100% - 85px);
    overflow-y: hidden;
    background-color: white;
    border-radius: 5px;
    margin-bottom: 5px;
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
    flex-grow: 1;
    width: 100%;
  }
  .col-6 {
    flex-grow: 1;
    position: relative;
    width: 50%;
    padding: 0 10px;
    height: 99%;
  }
  .list-controls {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .list-group-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-list:only-child {
    text-align: center;
  }
  li span:hover {
    cursor: ponter;
  }
  li :global(svg path),
  li :global(svg) {
    pointer-events: none;
  }

  @media screen and (max-width: 600px) {
    .controls h4 strong {
      display: none;
    }
    .controls h4 {
      width: 60px;
      margin: 0 6px;
    }
  }
</style>
