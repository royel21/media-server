<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import { validGenres } from "src/ShareComponent/utils";

  export let error = "";
  export let ref = null;
  export let hide;
  export let socket;

  let message = "";
  let tags = [];

  const types = [
    { Id: "mangas", Name: "Mangas" },
    { Id: "videos", Name: "Videos" },
  ];

  let file = { FilesType: "mangas", DirectoryId: "Select Directory", Genres: "" };

  let options = [];

  const submit = async (e) => {
    message = "";
    if (!file.Name) {
      return (error = "Name Can't Be Empty");
    }

    if (!file.DirectoryId) {
      return (error = "Select A Directory");
    }

    if (file.Status) {
      file.Genres = validGenres(file.Genres + ", Completed", tags);
    }

    const result = await apiUtils.post("admin/folders/folder-create", file);
    error = result.error;
    if (result.valid) {
      if (/^http/.test(file.Cover)) {
        socket.emit("download-server", {
          action: "Create-Cover",
          datas: { Id: result.Id, imgUrl: file.Cover },
        });
      }
      message = `Folder: ${file.Name} Create Succefully`;
      if (result.exist) {
        socket.emit("scan-dir", { Id: result.Id, isFolder: true });
      }
    }
  };

  const onChange = ({ target: { name, value, checked, type } }) => {
    if (type === "checkbox") value = checked;
    if (name === "Genres") value = validGenres(value, tags);
    file[name] = value;
  };

  onMount(async () => {
    const data = await apiUtils.admin(["folders", "dirs"]);
    if (data.dirs) {
      tags = data.tags || [];
      options = [{ Name: "Select Directory" }, ...data.dirs.map((d) => ({ Id: d.Id, Name: d.FullPath }))];
    }
  });

  const onKeyDown = (e) => {
    if (e.keyCode === 27) hide();
  };
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }} on:keydown={onKeyDown} tabindex="-1">
    <div class="modal-header">
      <h4>Create New Folder</h4>
    </div>
    <form bind:this={ref} action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        <TextAreaInput {file} key="Name" style="margin-bottom: 5px" rows="3" focus={true} {onChange} />
        <TextAreaInput {file} key="AltName" style="margin-bottom: 5px" rows="3" {onChange} />
        <TextAreaInput {file} key="Genres" style="margin-bottom: 5px" rows="2" {onChange} />
        <TextAreaInput {file} key="Description" rows="4" {onChange} />
        <Input key="Author" item={file} {onChange} sept=", " />
        <Input key="Server" item={file} {onChange} />
        <Input key="Cover" item={file} {onChange} />
        <CheckBox label="Completed" key="Status" item={file} />
        <CheckBox label="Is Adult" key="IsAdult" item={file} />
        <Select label="Files Type" key="FilesType" options={types} item={file} {onChange} />
        <Select label="Directories" key="DirectoryId" {options} item={file} {onChange} />
      </div>
      <div class="error">{error || ""}</div>
      <div class="message">{message || ""}</div>
      <div class="modal-footer">
        <button type="submit" class="btn">Create</button>
        <button type="button" class="btn" on:click={hide}>Close</button>
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
  .message {
    color: rgb(3 16 255);
    font-weight: 600;
  }
  .message:empty {
    display: none;
  }

  @media screen and (max-width: 450px) {
    .modal {
      width: 390px;
    }
  }

  @media screen and (max-height: 700px) {
    .modal-container {
      overflow-y: auto;
      padding-top: 10px;
    }
    .modal {
      margin-top: auto;
      margin-bottom: 20px;
    }
  }
</style>
