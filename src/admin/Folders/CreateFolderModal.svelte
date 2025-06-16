<script>
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import { validGenres } from "src/ShareComponent/utils";
  import Dialog from "src/ShareComponent/Dialog.svelte";

  export let error = "";
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
</script>

<div class="create-folder">
  <Dialog cancel={hide} confirm={submit}>
    <svelte:fragment slot="modal-header">
      <h4>Create New Folder</h4>
    </svelte:fragment>
    <svelte:fragment slot="modal-body">
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
    </svelte:fragment>
  </Dialog>
</div>

<style>
  .create-folder :global(.input-control) {
    margin-bottom: 5px;
  }
  .create-folder :global(.input-label) {
    width: 145px;
  }

  @media screen and (max-width: 450px) {
    .create-folder :global(.modal-container) {
      width: 390px;
    }
  }

  @media screen and (max-height: 700px) {
    .create-folder :global(.modal-container) {
      display: block;
      overflow: auto;
    }
    .create-folder :global(.modal) {
      position: initial;
      margin: 10px auto;
    }
  }
</style>
