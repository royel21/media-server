<script>
  import { getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "../Component/Select.svelte";
  import TextAreaInput from "../Component/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import { isDiff, validGenres, validateAuthor, validAltName } from "../Utils";
  import { setMessage } from "../Store/MessageStore";

  export let folderId;
  let hasChanges = false;
  let error = "";
  const socket = getContext("socket");
  let folder = {};
  let imageData = { Id: "", Url: "" };
  let old = {};
  let transfer = false;

  let options = [];

  const loadDetails = async (Id) => {
    folder = { Id };
    imageData = { Id, Url: "" };
    const data = await apiUtils.admin(["folders", "folder", Id]);
    if (data.dirs) {
      imageData.Id = Id;
      folder.Name = data.Name;
      folder.Description = data.Description;
      folder.Genres = data.Genres;
      folder.AltName = data.AltName;
      folder.IsAdult = data.IsAdult;
      folder.DirectoryId = data.DirectoryId;
      folder.Author = data.Author;
      folder.Status = data.Status;
      folder.Server = data.Server;
      options = data.dirs.map((d) => ({ Id: d.Id, Name: d.FullPath }));
      old = { ...folder };
    }
    transfer = false;
  };

  const onChange = ({ target: { name, value, type, checked } }) => {
    if (name === "Genres") {
      value = validGenres(value);
    }

    if (name === "AltName") {
      value = validAltName(value);
    }

    if (name === "Author") {
      value = validateAuthor(value);
    }

    if (type === "checkbox") {
      value = checked;
    }

    folder[name] = value || null;

    hasChanges = isDiff(old, folder);
    error = "";
  };
  const onUrl = ({ target: { value } }) => {
    imageData.Url = value;
    error = "";
  };

  const cancel = () => {
    folder = { ...old };
    hasChanges = false;
  };

  const onCoverUpdate = (result) => {
    if (result.Id === folderId) {
      if (result.valid) {
        imageData.Url = "";
        setMessage({ msg: `Cover for: ${folder.Name} was updated` });
      } else {
        setMessage({ error: true, msg: `Could't get the image from Url: ${imageData.Url}` });
      }
    }
  };

  socket.off("cover-update", onCoverUpdate);
  socket.on("cover-update", onCoverUpdate);

  const save = async () => {
    if (imageData.Url && /^http/.test(imageData.Url)) {
      socket.emit("download-server", { action: "Create-Cover", datas: { Id: folderId, imgUrl: imageData.Url } });
    }

    if (hasChanges) {
      if (!folder.Name) {
        return (error = "Name Can't be empty");
      }
      socket.emit("rename-folder", { ...folder, Transfer: transfer });
      hasChanges = false;
      old = { ...folder };
      transfer = false;
    }
  };

  $: loadDetails(folderId);
</script>

<div class="detail">
  <div class="error">{error || ""}</div>
  <div class="d-content">
    <TextAreaInput file={folder} key="Name" style="margin-bottom: 5px" rows="3" {onChange} />
    <TextAreaInput file={folder} key="AltName" style="margin-bottom: 5px" sept="; " rows="3" {onChange} />
    <TextAreaInput file={folder} key="Genres" style="margin-bottom: 5px" rows="2" sept="," {onChange} />
    <TextAreaInput file={folder} key="Description" rows="4" {onChange} />
    <Input key="Author" item={folder} {onChange} sept=", " />
    <Input key="Server" item={folder} {onChange} />
    <CheckBox label="Completed" key="Status" item={folder} {onChange} />
    <CheckBox label="Is Adult" key="IsAdult" item={folder} {onChange} />
    <CheckBox key="transfer" item={{ transfer }} onChange={() => (transfer = !transfer)} />
    {#if transfer}
      <Select label="Directories" key="DirectoryId" {options} item={folder} {onChange} />
    {/if}
    <Input key="Url" item={imageData} onChange={onUrl} />
  </div>
</div>
{#if hasChanges || imageData.Url}
  <div class="d-buttons">
    <button type="button" class="btn primary" on:click={save}>Save</button>
    <button type="button" class="btn" on:click={cancel}>Cancel</button>
  </div>
{/if}

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
  .d-buttons .btn:not(:last-child) {
    margin-right: 15px;
  }
</style>
