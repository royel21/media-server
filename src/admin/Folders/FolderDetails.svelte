<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "../Component/Select.svelte";
  import TextAreaInput from "../Component/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import { validGenres } from "../Utils";

  export let folderId;
  export let Name;
  let hasChanges = false;
  let error = "";
  const socket = getContext("socket");
  let folder = { Name };

  let options = [];

  const loadDetails = async (Id, Name) => {
    folder.Name = Name;
    const data = await apiUtils.admin(["folders", "folder", Id]);
    folder.Description = data.Description;
    folder.Genres = data.Genres;
    folder.AltName = data.AltName;
    folder.IsAdult = data.IsAdult;
    folder.DirectoryId = data.DirectoryId;
    folder.Author = data.Author;
    options = data.dirs.map((d) => ({ Id: d.Id, Name: d.FullPath }));
  };

  const onChange = ({ target: { name, value, checked, type } }) => {
    if (type === "checkbox") value = checked;
    if (name === "Genres") value = validGenres(value);
    folder[name] = value;
    hasChanges = true;
  };

  const save = () => {
    if (!folder.Name) {
      return (error = "Name Can't be empty");
    }

    socket.emit("rename-folder", folder);
    hasChanges = false;
  };

  $: loadDetails(folderId, Name);
</script>

<div class="detail">
  <div class="error">{error || ""}</div>
  <div class="d-content">
    <TextAreaInput file={folder} key="Name" style="margin-bottom: 5px" rows="3" focus={true} {onChange} />
    <TextAreaInput file={folder} key="AltName" style="margin-bottom: 5px" rows="3" {onChange} />
    <TextAreaInput file={folder} key="Genres" style="margin-bottom: 5px" rows="2" {onChange} />
    <TextAreaInput file={folder} key="Description" rows="4" />
    <Input key="Author" item={folder} />
    <CheckBox label="Completed" key="Status" item={folder} my="5px" />
    <CheckBox label="Is Adult" key="IsAdult" item={folder} />
    <CheckBox mt="5px" key="Transfer" item={folder} {onChange} />
    {#if folder.Transfer}
      <Select label="Directories" mt="5px" key="DirectoryId" {options} item={folder} />
    {/if}
  </div>
</div>
<div class="d-buttons">
  <button type="button" class="btn" class:primary={hasChanges} on:click={save}>Save</button>
</div>

<style>
  .detail {
    position: relative;
    padding-top: 10px;
    height: calc(100% - 90px);
    overflow-y: auto;
  }
  .detail :global(.input-label) {
    width: 145px;
  }
  .d-buttons {
    position: absolute;
    bottom: 5px;
  }
  .d-buttons .primary {
    background-image: linear-gradient(-120deg, rgb(16 165 220), #007bff, #0db9d8);
  }
</style>
