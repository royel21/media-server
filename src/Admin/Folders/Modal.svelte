<script>
  import { fade } from "svelte/transition";
  export let file;
  export let modalType;
  console.log("Del", modalType);
</script>

<style>
  .del-label {
    width: fit-content;
  }
  strong {
    color: red;
  }
  input[type="checkbox"] {
    display: none;
  }
  input[type="checkbox"]:checked + label i:before {
    content: "\f00c";
  }
  label {
    text-align: center;
  }
</style>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>{modalType.title}</h3>
    </div>
    <form action="#" on:submit>
      <div class="modal-body">
        {#if !modalType.Del}
          <div class="input-group">
            <div class="input-group-prepend">
              <label class="input-group-text">Name</label>
            </div>
            <input
              type="text"
              name="Name"
              class="form-control"
              bind:value={file.Name} />
          </div>
        {:else}
          <p>
            Are you sure you want to remove
            <strong>{file.Name}</strong>
          </p>
          {#if modalType.isFile}
            <div class="input-group">
              <div class="input-group-prepend">
                <label class="input-group-text del-label">
                  Delete From System
                </label>
              </div>
              <input id="sysdel" type="checkbox" />
              <label for="sysdel" class="form-control">
                <i class="fas fa-times" />
              </label>
            </div>
          {/if}
        {/if}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click>Cancel</button>
        <button type="submit" class="btn">
          {modalType.Del ? 'Remove' : 'Update'}
        </button>
      </div>
    </form>
  </div>
</div>
