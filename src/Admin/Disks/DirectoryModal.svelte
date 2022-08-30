<script>
  import { fade } from "svelte/transition";
  export let createDirectory;
  export let hideModal;
  let Type = "Mangas";
  let IsAdult = false;

  const create = () => {
    createDirectory(Type, IsAdult);
  };
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Create</h3>
    </div>
    <div class="modal-body">
      <div class="input-group">
        <div class="input-group-prepend">
          <label for="Name" class="input-group-text">Type</label>
        </div>
        <select class="form-control" name="Type" bind:value={Type}>
          <option value="Mangas">Mangas</option>
          <option value="Videos">Videos</option>
        </select>
      </div>
      <div class="input-group">
        <div class="input-group-prepend">
          <label for="is-adult" class="input-group-text">Is Adult</label>
        </div>
        <input id="is-adult" type="checkbox" bind:checked={IsAdult} />
        <label id="check-icon" for="is-adult" class="form-control">
          <span class={`ad-icon fas fa-${IsAdult ? "check" : "times"}`} />
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" on:click={hideModal}>Cancel</button>
      <button class="btn" on:click={create}>Create</button>
    </div>
  </div>
</div>

<style>
  .modal {
    width: 250px;
  }
  #is-adult {
    display: none;
  }
  label {
    width: 80px;
  }
  #check-icon {
    text-align: center;
    font-size: 16px;
    cursor: pointer;
  }
  #check-icon:active span {
    transform: scale(1.1);
  }
</style>
