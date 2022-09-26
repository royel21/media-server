<script>
  import { createEventDispatcher } from "svelte";
  import { FavoritesStores } from "../../User/Stores/FavoritesStores";

  export let Type;
  export let type;
  export let isFav;
  export let favClicked;
  export let favId;
  const dispath = createEventDispatcher();
  let thisEl;
  let showList = false;

  const addToFav = async (event) => {
    let FolderId = event.target.closest(".file").id;
    let FavoriteId = event.target.id;
    const data = await apiUtils.postFav("add-folder", { FolderId, FavoriteId });

    if (data.success) {
      thisEl.className = "fas fa-star";
    }
  };

  const removeFile = async (FolderId) => {
    let data = await apiUtils.postFav("remove-folder", { id: favId, fid: FolderId });

    if (data.removed) {
      dispath("removeFile", FolderId);
    }
  };

  $: if (thisEl && favClicked === thisEl) {
    showList = thisEl.classList.contains("far");
    if (thisEl.classList.contains("fa-trash-alt")) {
      removeFile(thisEl.closest(".file").id);
    }
  } else {
    showList = false;
  }
</script>

<span class="fav-control">
  <span class="fav-icon">
    {#if Type === "Folder"}
      {#if type.startsWith("favorites")}
        <i class="fas fa-trash-alt text-danger" bind:this={thisEl} />
      {:else if isFav}
        <i class="fas fa-star" />
      {:else}
        <i class="far fa-star" bind:this={thisEl} />
      {/if}
    {/if}
  </span>
  {#if showList}
    <ul>
      {#each $FavoritesStores as fav}
        <li id={fav.Id} on:click={addToFav}>{fav.Name}</li>
      {/each}
    </ul>
  {/if}
</span>

<style>
  .fav-control {
    position: relative;
  }
  ul {
    position: absolute;
    top: 35px;
    right: 0;
    z-index: 1;
    background: rgb(3, 162, 236);
    border-radius: 0.25rem;
    width: max-content;
  }
  li {
    padding: 2px 8px;
    font-size: 1rem;
    cursor: pointer;
    text-align: left;
  }
  li:hover {
    background-color: rgba(68, 71, 71, 0.247);
  }
  li:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  li:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  li:not(:last-child) {
    border-bottom: 1px solid;
  }
</style>
