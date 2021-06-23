<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import axios from "axios";
  export let createDirectory;
  export let hideModal;
  let Type;
  console.log(hideModal, createDirectory, Type);

  const create = () => {
    createDirectory(Type);
  };
</script>

<style>
  .modal {
    width: 250px;
  }
</style>

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
    </div>
    <div class="modal-footer">
      <button class="btn" on:click={hideModal}>Cancel</button>
      <button class="btn" on:click={create}>Create</button>
    </div>
  </div>
</div>
