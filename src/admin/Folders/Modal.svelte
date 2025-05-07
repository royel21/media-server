<script>
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";

  export let file;
  export let modalType;
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
    if (tempFile.Ex) {
      file.Name = tempFile.Name + tempFile.Ex;
    }
    acept(file, deleteFromSys);
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

  if (file?.Name && !modalType.Del) loadTemp(file);
</script>

<Dialog class="del-modal" on:keydown={onKeyDown} confirm={submit} cancel={hide}>
  <h4 slot="modal-header">{modalType.title}</h4>
  <div id="fol-diag" slot="modal-body">
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
</Dialog>

<style>
  :global(.modal.del-modal) {
    width: 400px;
  }
  .del-label {
    height: 32px;
    width: fit-content;
  }
  .check-del {
    display: inline-block;
    height: 32px;
    cursor: pointer;
    text-align: center;
  }
  .check-del :global(svg) {
    top: 0;
  }
  strong {
    color: rgb(255, 166, 0);
  }
  input[type="checkbox"] {
    display: none;
  }
</style>
