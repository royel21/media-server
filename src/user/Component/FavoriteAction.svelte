<script>
  import Icons from "../../icons/Icons.svelte";
  import apiUtils from "../../apiUtils";
  import { FavoritesStores } from "../../user/Stores/FavoritesStores";
  export let isFav = [];
  export let favClicked;

  let thisEl = "";

  let starFill = { name: "starfill", color: "rgba(248, 224, 6, 0.952)" };
  let star = { name: "star" };
  let icon = isFav?.length ? starFill : star;

  const addToFav = async (event) => {
    let FolderId = event.target.closest(".file").id;
    let FavoriteId = event.target.id;
    const data = await apiUtils.postFav("add-folder", { FolderId, FavoriteId });

    if (data.success) {
      icon = starFill;
    }
  };

  const getFavs = () => {
    const favs = $FavoritesStores;
    return favs.filter((fv) => !isFav.includes(fv.Id));
  };
</script>

<span class="fav-star" bind:this={thisEl}>
  <Icons name={icon.name} color={icon.color} />
  {#if thisEl === favClicked}
    <ul>
      {#each getFavs() as fav}
        <li id={fav.Id} on:click={addToFav}>{fav.Name}</li>
      {/each}
    </ul>
  {/if}
</span>

<style>
  span {
    position: relative;
    cursor: pointer;
  }

  span :global(svg:active) {
    pointer-events: none;
  }

  ul {
    position: absolute;
    top: 2px;
    right: 32px;
    z-index: 1;
    background: rgb(3, 162, 236);
    border-radius: 0.25rem;
    width: max-content;
  }
  ul:after {
    display: inline-block;
    content: " ";
    position: absolute;
    top: 8px;
    right: -5px;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background: rgb(3, 162, 236);
    z-index: -1;
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
