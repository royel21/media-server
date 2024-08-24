<script>
  import { fade } from "svelte/transition";
  import TextAreaInput from "../Component/TextAreaInput.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let file;
  export let modalType;
  export let ref = null;
  export let deleteFromSys = null;
  export let hide;
  export let acept;

  let tempFile = { Name: "", Ex: "" };

  const loadTemp = (f) => {
    if (/\.(zip|mp4|mkv|ogg|avi)$/i.test(f.Name)) {
      tempFile.Ex = "." + f.Name.split(".").pop();
    }
    tempFile.Name = f.Name?.replace(tempFile.Ex, "");
  };

  const submit = () => {
    if (file.Name) {
      file.Name = tempFile.Name + tempFile.Ex;
      acept(file, deleteFromSys);
    }
  };

  const onKeyDown = (e) => {
    if (file) {
      if (e.keyCode === 13 && e.ctrlKey) {
        submit();
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.keyCode === 27) hide();
    }
  };

  const onChanges = ({ target: { checked } }) => (deleteFromSys = checked);

  if (file?.Name) loadTemp(file);
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }} on:keydown={onKeyDown} tabindex="-1">
    <div class="modal-header">
      <h4>{modalType.title}</h4>
    </div>
    <form bind:this={ref} action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        {#if modalType.Del}
          <p>Are you sure you want to remove <strong>{file.Name}</strong></p>
          <div class="input-group">
            <div class="input-group-prepend">
              <label for="sysdel" class="input-group-text del-label"> Delete From System </label>
            </div>
            <label for="sysdel" class="form-control check-del">
              <input id="sysdel" type="checkbox" on:change={onChanges} />
              <Icons name={deleteFromSys ? "check" : "times"} />
            </label>
          </div>
        {:else}
          <TextAreaInput file={tempFile} key="Name" style="margin-bottom: 5px" rows="3" focus={true} />
        {/if}
      </div>
      <div class="error">{modalType.error || ""}</div>
      <div class="modal-footer">
        <button type="submit" class="btn">
          {modalType.Del ? "Remove" : "Update"}
        </button>
        <button type="button" class="btn" on:click={hide}>Cancel</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 400px;
    outline: none;
  }
  .modal-container :global(.input-control) {
    margin-bottom: 5px;
  }
  .modal-container :global(.input-label) {
    width: 145px;
  }
  .del-label {
    width: fit-content;
  }
  .check-del {
    cursor: pointer;
  }
  strong {
    color: red;
  }
  input[type="checkbox"] {
    display: none;
  }
  label {
    text-align: center;
  }
  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }
</style>
