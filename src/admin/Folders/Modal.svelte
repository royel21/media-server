<script>
  import { fade } from "svelte/transition";
  import CheckBox from "../Component/CheckBox.svelte";
  import Input from "./TextAreaInput.svelte";

  export let file;
  export let modalType;
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>{modalType.title}</h4>
    </div>
    <form action="#" on:submit|preventDefault on:keydown>
      <div class="modal-body">
        {#if modalType.Del}
          <p>Are you sure you want to remove <strong>{file.Name}</strong></p>
          <div class="input-group">
            <div class="input-group-prepend">
              <label for="sysdel" class="input-group-text del-label"> Delete From System </label>
            </div>
            <input id="sysdel" type="checkbox" />
            <label for="sysdel" class="form-control">
              <i class="fas fa-times" />
            </label>
          </div>
        {:else}
          <Input {file} key="Name" style="margin-bottom: 5px" rows="3" />
          {#if file.Type === "Folder"}
            <Input {file} key="Genres" style="margin-bottom: 5px" rows="2" />
            <Input {file} key="Description" rows="4" />
            <CheckBox label="Completed" key="Status" item={file} my="5px" />
            <CheckBox label="Is Adult" key="IsAdult" item={file} />
          {/if}
        {/if}
      </div>
      <div class="error">{modalType.error || ""}</div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click>Cancel</button>
        <button type="submit" class="btn">
          {modalType.Del ? "Remove" : "Update"}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 400px;
  }
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
  .error:empty {
    display: none;
  }
  .error {
    color: red;
    font-weight: 600;
  }
  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }
</style>
