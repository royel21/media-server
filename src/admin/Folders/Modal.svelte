<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import apiUtils from "../../apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "../Component/Select.svelte";
  import Input from "./TextAreaInput.svelte";
  import Icons from "../../icons/Icons.svelte";

  export let file;
  export let modalType;
  export let ref = null;
  export let deleteFromSys = null;

  let options = [];
  let tempFile = { Name: "", Ex: "" };
  const dispatch = createEventDispatcher();

  onMount(async () => {
    if (file.Type === "Folder") {
      const data = await apiUtils.admin(["folders", "folder", file.Id]);
      file.Description = data.Description;
      file.Genres = data.Genres;
      file.AltName = data.AltName;
      file.IsAdult = data.IsAdult;
      file.DirectoryId = data.DirectoryId;
      options = data.dirs.map((d) => ({ Id: d.Id, Name: d.FullPath }));
    }
  });

  const onChange = ({ target: { name, value, checked, type } }) => {
    if (type === "checkbox") value = checked;
    file[name] = value;
  };

  const loadTemp = (f) => {
    const ex = f.Name.split(".").pop();
    if (/zip|mp4|mkv|ogg|avi$/i.test(ex)) {
      tempFile.Ex = "." + ex;
    }
    tempFile.Name = f.Name?.replace(tempFile.Ex, "");
  };

  const submit = (e) => {
    file.Name = tempFile.Name + tempFile.Ex;
    dispatch("submit", e);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      submit(e);
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.keyCode === 27) dispatch("click", e);
  };

  const onChanges = ({ target: { checked } }) => (deleteFromSys = checked);

  loadTemp(file);
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }} on:keydown={onKeyDown} tabindex="0">
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
          <Input file={tempFile} key="Name" style="margin-bottom: 5px" rows="3" focus={true} />
          {#if file.Type === "Folder"}
            <Input {file} key="AltName" style="margin-bottom: 5px" rows="3" />
            <Input {file} key="Genres" style="margin-bottom: 5px" rows="2" />
            <Input {file} key="Description" rows="4" />
            <CheckBox label="Completed" key="Status" item={file} my="5px" />
            <CheckBox label="Is Adult" key="IsAdult" item={file} />
            <CheckBox mt="5px" key="Transfer" item={file} {onChange} />
            {#if file.Transfer}
              <Select label="Directories" mt="5px" key="DirectoryId" {options} item={file} />
            {/if}
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
    outline: none;
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
