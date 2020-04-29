<script>
  import { fade } from "svelte/transition";
  export let file;
  export let title;
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Edit {title}</h3>
    </div>
    <form action="#" on:submit>
      <div class="modal-body">
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
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click>Cancel</button>
        <button type="submit" class="btn">Update</button>
      </div>
    </form>
  </div>
</div>
