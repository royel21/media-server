<script>
  import { FavoritesStores } from "../../user/Stores/FavoritesStores";
  export let isFav = [];
  export let favClicked;

  let thisEl = "";

  const addToFav = async (event) => {
    let FolderId = event.target.closest(".file").id;
    let FavoriteId = event.target.id;
    const data = await apiUtils.postFav("add-folder", { FolderId, FavoriteId });

    if (data.success) {
      thisEl.className = "fas fa-star";
    }
  };

  const getFavs = () => {
    const favs = $FavoritesStores;
    return favs.filter((fv) => !isFav.includes(fv.Id));
  };
</script>

<i class="fa-star" class:fas={isFav?.length} class:far={!isFav?.length} bind:this={thisEl} />
{#if thisEl === favClicked}
  <ul>
    {#each getFavs() as fav}
      <li id={fav.Id} on:click={addToFav}>{fav.Name}</li>
    {/each}
  </ul>
{/if}

<style>
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
