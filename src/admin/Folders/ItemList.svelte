<script>
  import apiUtils from "../../apiUtils";
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
  export let scanning = [];

  const addGenres = ({ target }) => {
    let Id = target.closest("li").id;
    apiUtils.admin(["folders", "changes-genres", Id, target.textContent]);
  };
  const addRaw = ({ target }) => {
    let Id = target.closest("li").id;
    apiUtils.admin(["folders", "folder-raw", Id]);
  };
</script>

<div id={title} class="file-list col-6">
  <slot name="first-tag" />
  <div class="controls">
    <slot name="btn-controls" />
    <Filter on:filter {filter} />
    <h4 class="text-center usn">{totalItems} <strong>- {title}</strong></h4>
    <slot name="btn-ctr-last" />
  </div>
  <div class="list-container">
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
          >
            {#if Type.includes("Folder")}
              <span
                ><Icons
                  name="sync"
                  box="0 0 512 512"
                  class={scanning.includes(Id) || Scanning ? "icon-spin" : ""}
                /></span
              >
              <span class="g-list" on:mouseenter|stopPropagation on:mouseleave|stopPropagation>
                {#if /manga/.test(FilesType)}
                  <span on:click={addGenres}>Mg</span>
                  <span on:click={addGenres}>Mhu</span>
                  <span on:click={addGenres}>Mhw</span>
                  <span on:click={addGenres}>Web</span>
                  <span on:click={addRaw}>Raw</span>
                {:else}
                  <span on:click={addGenres}>sort</span>
                {/if}
              </span>
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
    overflow-y: auto;
  }
  .controls {
    position: initial;
    display: flex;
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
    padding: 0 15px;
  }
  #Files {
    border-left: 1px solid;
    width: 30%;
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

  @media screen and (max-width: 600px) {
    #Folders {
      border-left: 1px solid;
      max-width: 60%;
    }
    #Files {
      width: 40%;
    }

    .controls h4 strong {
      display: none;
    }
    .controls h4 {
      width: 60px;
    }
  }
</style>
