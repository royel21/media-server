<script>
  import { navigate } from "svelte-routing";
  import { FavoritesStores, addUpdateFavorite, removeFavorite } from "../../Stores/FavoritesStores";
  import Icons from "../../../icons/Icons.svelte";

  export let id = "";
  let currentFav = {};
  let error;

  const saveFavorite = () => {
    if (currentFav.Name) {
      currentFav.Type == "";
      addUpdateFavorite(currentFav).then((result) => {
        if (result.Id !== id) {
          navigate(`/favorites/${result.Id}`);
        }
      });
      error = "";
    }
  };

  const clearFavorite = () => {
    currentFav = { Name: "", Type: "Manga" };
    error = "";
  };

  const editFavorite = (e) => {
    currentFav = $FavoritesStores.find((f) => f.Id === e.target.closest("tr").id);
    error = "";
  };

  const removeFav = (e) => {
    let tr = e.target.closest("tr");
    let type = tr.querySelector("td:nth-child(2)").textContent;
    // Clear input delete is currentFav
    removeFavorite(tr.id, type).then((data) => {
      //Navegate to first favorite
      if (data.removed) {
        navigate(`/favorites/${$FavoritesStores[0].Id}`);
      } else {
        error = data.msg;
      }
    });
  };

  const loadFavorite = (event) => {
    navigate(`/favorites/${event.target.closest("tr").id}`);
    error = "";
  };

  $: id, (currentFav = { Name: "", Type: "Manga" });
</script>

<div class="first-controls">
  <label for="show-favs"><Icons name="heart" /></label>
  <input type="checkbox" name="show-favorites" id="show-favs" />
  <div id="fav-manager" class="card text-light">
    <div class="modal-title">
      <div id="fav-controls">
        <div class="input-group-prepend">
          <label for="fav-name" id="addfav" class="input-group-text" on:click={saveFavorite}>
            <Icons name="save" />
          </label>
          <div class="i-control">
            <input
              name="fav-name"
              type="text"
              class="form-control"
              bind:value={currentFav.Name}
              placeholder="New Favorite"
            />
            <span on:click={clearFavorite}>
              <Icons name="timescircle" />
            </span>
          </div>
        </div>
      </div>
      <div class="text-danger" />
    </div>
    <div class="errors">{error || ""}</div>
    <div class="modal-body">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {#each $FavoritesStores as fav}
            <tr id={fav.Id} class:active={fav.Id === id}>
              <td on:click={loadFavorite} data-title={fav.Name}>
                {fav.Name}
              </td>
              <td class="fa-icons">
                <span on:click={editFavorite}>
                  <Icons name="edit" color="rgba(20, 139, 236, 0.925)" />
                </span>
                <span on:click={removeFav}>
                  <Icons name="trash" color="rgba(252, 1, 1, 0.855)" />
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .fa-icons span {
    display: inline-block;
  }
  .first-controls {
    position: absolute;
    z-index: 99;
    pointer-events: all;
  }
  .first-controls :global(svg.icon-heart) {
    fill: rgba(248, 224, 6, 0.953);
    height: 29px;
    width: 42px;
    top: 1px;
  }
  .modal-body .active :global(svg.icon-edit) {
    fill: white;
  }
  #addfav :global(svg) {
    fill: black;
    height: 24px;
    width: 32px;
    top: 0;
  }
  #show-favs[type="checkbox"] {
    display: none;
  }
  #fav-manager {
    position: absolute;
    visibility: hidden;
    color: black;
    background: white;
    height: max-content;
    width: 380px;
    bottom: -121px;
    left: -149px;
    padding: 5px;
    border-radius: 0.25rem;
    min-height: 240px;
    background: rgb(221, 170, 94);
    pointer-events: none;
    transform: scaleX(0) scaleY(0);
    transition: 0.3s all ease-out;
  }
  #show-favs:checked + div {
    visibility: visible;
    pointer-events: all;
    transform: scaleX(1) scaleY(1) translateX(150px) translateY(-161px);
  }
  tr {
    position: relative;
  }
  .table tr td:first-child,
  .table tr th:first-child {
    white-space: nowrap;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
  }

  #fav-manager td:last-child {
    width: 75px;
  }
  #fav-manager .active td {
    background-color: rgba(20, 139, 236, 0.925);
    color: white;
  }
  .modal-title {
    margin-bottom: 5px;
  }
  table {
    border-collapse: collapse;
    border-radius: 1em;
    overflow: hidden;
    width: 100%;
  }

  th,
  td {
    padding: 0.5em;
    background: #ddd;
    border-bottom: 2px solid white;
  }
  table tr {
    border: initial;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody td:first-child {
    cursor: pointer;
  }

  .i-control {
    width: 100%;
    position: relative;
    margin-right: 2px;
  }
  .i-control span {
    top: 3px;
  }
  input {
    padding-right: 30px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .errors {
    color: red;
    font-weight: 600;
    margin: 5px auto;
  }
  .errors:empty {
    display: none;
  }
</style>
