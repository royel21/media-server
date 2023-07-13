<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import apiUtils from "../../apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "../Component/Select.svelte";
  import Input from "./TextAreaInput.svelte";

  export let error;
  export let ref = null;
  export let hide;
  export let socket;

  let message = "";

  const types = [
    { Id: "mangas", Name: "Mangas" },
    { Id: "videos", Name: "Videos" },
  ];

  let file = { FilesType: "mangas" };

  let options = [];

  onMount(async () => {
    const data = await apiUtils.admin(["folders", "folder", ""]);
    options = [{ Name: "Select Directory" }, ...data.dirs.map((d) => ({ Id: d.Id, Name: d.FullPath }))];
  });

  const submit = async (e) => {
    message = "";
    console.log(file);
    if (!file.Name) {
      return (error = "Name Can't Be Empty");
    }

    if (!file.DirectoryId) {
      return (error = "Select A Directory");
    }

    const result = await apiUtils.post("admin/folders/folder-create", file);
    error = result.error;
    if (result.valid) {
      message = `Folder: ${file.Name} Create Succefully`;
      if (result.Id) {
        socket.emit("scan-dir", { Id: result.Id, isFolder: true });
      }
    }
  };
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }} tabindex="0">
    <div class="modal-header">
      <h4>Create New Folder</h4>
    </div>
    <form bind:this={ref} action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        <Input {file} key="Name" style="margin-bottom: 5px" rows="3" focus={true} />
        <Input {file} key="AltName" style="margin-bottom: 5px" rows="3" />
        <Input {file} key="Genres" style="margin-bottom: 5px" rows="2" />
        <Input {file} key="Description" rows="4" />
        <CheckBox label="Completed" key="Status" item={file} my="5px" />
        <CheckBox label="Is Adult" key="IsAdult" item={file} />
        <Select label="Files Type" key="FilesType" mt="5px" options={types} item={file} />
        <Select label="Directories" mt="5px" key="DirectoryId" {options} item={file} />
      </div>
      <div class="error">{error || ""}</div>
      <div class="message">{message || ""}</div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click={() => hide()}>Close</button>
        <button type="submit" class="btn">Create</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 400px;
    outline: none;
  }
  .error {
    color: red;
    font-weight: 600;
  }
  .message {
    color: rgb(3 16 255);
    font-weight: 600;
  }
  .message:empty,
  .error:empty {
    display: none;
  }

  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }
</style>
