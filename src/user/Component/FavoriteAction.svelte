<script>
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import { FavoritesStores } from "src/user/Stores/FavoritesStores";
  import { onMount } from "svelte";
  export let isFav = [];
  let favClicked;

  let thisEl = "";

  let starFill = { name: "starfill", color: "rgba(248, 224, 6, 0.952)" };
  let star = { name: "star" };
  let icon = isFav?.length ? starFill : star;

  const addToFav = async ({ target }) => {
    let FolderId = target.closest(".file").id;
    let FavoriteId = target.id;
    const data = await apiUtils.postFav("add-folder", { FolderId, FavoriteId });

    if (data.success) {
      icon = starFill;
    }
    target.closest(".fav-list").style.display = "none";
  };

  const clicked = ({ target }) => {
    document.querySelectorAll(".fav-list").forEach((el) => {
      el.style.display = "none";
    });

    target.querySelector(".fav-list").style.display = "block";
  };

  const getFavs = () => {
    const favs = $FavoritesStores;
    return favs.filter((fv) => !isFav.includes(fv.Id));
  };

  $: icon = isFav?.length ? starFill : star;
</script>

<span class="fav-star" bind:this={thisEl} on:click={clicked}>
  <Icons name={icon.name} color={icon.color} />

  <ul class="fav-list">
    {#each getFavs() as fav}
      <li id={fav.Id} on:click|stopPropagation={addToFav} on:keydown>{fav.Name}</li>
    {/each}
  </ul>
</span>

<style>
  .fav-list {
    display: none;
  }
  span {
    position: relative;
    cursor: pointer;
  }

  span :global(svg:active) {
    pointer-events: none;
  }

  ul {
    position: absolute;
    bottom: 0px;
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
    bottom: 8px;
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
  @media screen and (max-width: 480px) {
    li {
      padding: 8px;
    }
  }
</style>
