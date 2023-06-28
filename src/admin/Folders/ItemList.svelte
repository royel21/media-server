<script>
  import Icons from "../../icons/Icons.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";
  export let filter;
  export let title;
  export let items;
  export let folderId;
  export let page = 1;
  export let totalPages = 0;
  export let totalItems = 0;
</script>

<div id={title} class="file-list col-6">
  <div class="controls">
    <Filter on:filter {filter} />
    <h4 class="text-center usn">{`${totalItems} - ${title}`}</h4>
  </div>
  <div class="list-container">
    <ul class="list-group text-dark">
      {#if items.length < 1}
        <li class="list-group-item empty-list">{`Not ${title} Found`}</li>
      {:else}
        {#each items as { Id, Name, Type, Status }}
          <li
            id={Id}
            class="list-group-item"
            class:active={folderId === Id}
            on:click
            on:mouseenter
            on:mouseleave
            on:mousemove
          >
            {#if Type.includes("Folder")}
              <span><Icons name="sync" color={Status ? "rgb(37, 140, 209);" : "rgb(202, 48, 48);"} /></span>
            {/if}
            <span><Icons name="edit" /></span>
            <span><Icons name="trash" /></span>
            {Name}
          </li>
        {/each}
      {/if}
    </ul>
  </div>
  <div class="list-controls">
    <Pagination {page} {totalPages} on:gotopage />
  </div>
</div>

<style>
  .list-container {
    height: calc(100% - 85px);
    overflow-y: auto;
  }
  .controls {
    position: initial;
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border: none;
    height: 45px;
  }
  .controls h4 {
    flex-grow: 1;
    width: 100%;
    width: 200px;
  }
  .col-6 {
    flex-grow: 1;
    position: relative;
    width: 50%;
    padding: 0 15px;
  }
  #Files {
    border-left: 1px solid;
  }
  .list-controls {
    margin-top: 5px;
    text-align: center;
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
</style>
