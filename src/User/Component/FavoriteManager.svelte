<script>
  import {
    FavoritesStores,
    addUpdateFavorite,
    removeFavorite
  } from "../Stores/FavoritesStores";
  import { navigate } from "svelte-routing";
  import { onDestroy } from "svelte";

  export let favId = "";
  let currentFav = {};
  let error;

  const saveFavorite = event => {
    currentFav.Type == "";
    addUpdateFavorite(currentFav).then(result => {
      if (result.Id !== favId) {
        navigate(`/favorites/${result.Id}`);
        console.log("navegate", result.Id);
      }
    });
  };

  const clearFavorite = () => {
    currentFav = { Name: "", Type: "Manga" };
  };

  const editFavorite = e => {
    currentFav = $FavoritesStores.find(f => f.Id === e.target.closest("tr").id);
  };

  const removeFav = e => {
    let tr = e.target.closest("tr");
    let type = tr.querySelector("td:nth-child(2)").textContent;
    // Clear input delete is currentFav
    removeFavorite(tr.id, type).then(() => {
      //Navegate to first favorite
      navigate(`/favorites/${$FavoritesStores[0].Id}`);
    });
  };

  const loadFavorite = event => {
    navigate(`/favorites/${event.target.closest("tr").id}`);
  };

  $: favId, (currentFav = { Name: "", Type: "Manga" });
</script>

<style>
  #fav-manager {
    position: absolute;
    color: black;
    background: white;
    height: max-content;
    width: 300px;
    bottom: 38px;
    left: 0px;
    padding: 5px;
    border-radius: 0.25rem;
    min-height: 240px;
    background: rgb(221, 170, 94);
    transition: 0.3s all;
    pointer-events: all;
  }
  tr {
    position: relative;
  }
  .table tr td:first-child,
  .table tr th:first-child {
    white-space: nowrap;
    text-align: left;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  #fav-manager td:nth-child(2),
  #fav-manager th:nth-child(2),
  #fav-manager td:nth-child(3),
  #fav-manager th:nth-child(3) {
    width: 50px;
  }
  #fav-manager .active td {
    background-color: rgba(20, 139, 236, 0.925);
    color: white;
  }
  #fav-manager .active .fa-edit {
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
  .table tr {
    border: initial;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody td:first-child {
    cursor: pointer;
  }
  #fav-manager .fas {
    font-size: 20px;
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
  select {
    width: fit-content;
  }
  .errors {
    color: red;
    font-weight: 600;
    margin: 5px auto;
  }
  .errors:empty {
    display: none;
  }
  tr td:first-child:hover:after {
    content: attr(data-title);
    display: inline-block;
    padding: 0 5px;
    position: absolute;
    left: 15px;
    width: max-content;
    background-color: #ddd;
    color: black;
    font-weight: 600;
    pointer-events: none;
    border-radius: 0.25rem;
  }
</style>

<div id="fav-manager" class="card text-light">
  <div class="modal-title">
    <div id="fav-controls">
      <div class="input-group-prepend">
        <label id="addfav" class="input-group-text" on:click={saveFavorite}>
          <i class="fas fa-save" />
        </label>
        <div class="i-control">
          <input
            type="text"
            class="form-control"
            bind:value={currentFav.Name}
            placeholder="New Favorite" />
          <span on:click={clearFavorite}>
            <i class="fas fa-times-circle" />
          </span>
        </div>
        <select class="form-control" bind:value={currentFav.Type}>
          <option>Manga</option>
          <option>Video</option>
        </select>
      </div>
    </div>
    <div class="text-danger" />
  </div>
  <div class="errors">{error || ''}</div>
  <div class="modal-body">
    <table class="table table-bordered bg-light table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each $FavoritesStores as fav}
          <tr id={fav.Id} class={fav.Id === favId ? 'active' : ''}>
            <td on:click={loadFavorite} data-title={fav.Name}>{fav.Name}</td>
            <td>{fav.Type}</td>
            <td>
              <span on:click={editFavorite}>
                <i class="fas fa-edit" />
              </span>
              <span on:click={removeFav}>
                <i class="fas fa-trash-alt" />
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
