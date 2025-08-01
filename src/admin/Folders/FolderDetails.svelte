<script>
  import { getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { isDiff, getSize3 } from "../Utils";
  import { setMessage } from "../Store/MessageStore";
  import { capitalize, validAltName, validateAuthor, validGenres } from "@share/utils";

  export let folderId;
  let hasChanges = false;
  let error = "";
  const socket = getContext("socket");
  let old = {};
  let tags = [];
  let removeTags = [];
  let folder = {};
  let options = [];
  let imageData = { Id: "", Url: "", file: "" };
  let transfer = false;
  let isModified;
  let time = new Date().getTime();

  const regx = /:|\?/g;

  const loadDetails = async (Id) => {
    folder = { Id };
    imageData = { Id, Url: "", file: "" };
    const data = await apiUtils.admin(["folders", "folder", Id], "fd");

    if (data.dirs && !options.length) {
      options = data.dirs
        .sort((a, b) => a.FullPath.localeCompare(b.FullPath))
        .map((d) => ({ Id: d.Id, Name: d.FullPath }));
    }

    if (data.dirs) {
      imageData.Id = Id;
      delete data.dirs;
      folder = { ...folder, ...data };
      old = { ...folder };
      delete old.image;
      tags = data.tags.filter((g) => !g.IsRemove).map((g) => g.Name);
      removeTags = data.tags.filter((g) => g.IsRemove).map((g) => g.Name);

      await loadFromDisk();
    }
    transfer = false;
    hasChanges = false;
  };

  const onChange = ({ target: { name, value, type, checked } }) => {
    if (name === "Name") {
      value = capitalize(value.replace(regx, ""));
    }

    if (name === "Genres") {
      value = validGenres(value, tags, removeTags);
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

  const prePaste = async () => {
    let text = await navigator.clipboard?.readText();
    let { AltName } = folder;
    const value = validAltName(text.replace(regx, ""));
    if (value && AltName === "N/A") {
      AltName = "";
    }

    if (AltName.includes(value)) return;

    folder.AltName = `${value}${AltName ? "; " + AltName : ""}`;
    hasChanges = isDiff(old, folder);
  };

  const copyName = async () => {
    if (folder.Name) {
      await navigator.clipboard?.writeText(folder.Name);
    }
  };

  const onUrl = ({ target: { value } }) => {
    imageData.Url = value;
    error = "";
  };

  const cancel = () => {
    folder = { ...folder, ...old };
    imageData = {};
    hasChanges = false;
  };

  const onCoverUpdate = (result) => {
    if (result.Id === folderId) {
      if (result.valid) {
        imageData.Url = "";
        imageData.file = "";
        setMessage({ msg: `Cover for: ${folder.Name} was updated` });
        time = new Date().getTime();
      } else {
        setMessage({ error: true, msg: `Could't get the image from Url: ${imageData.Url}` });
      }
    }
  };

  const loadFromDisk = async () => {
    const data = await apiUtils.admin(["folders", "file-info", folderId], "fd-info");

    if (data.Last) {
      folder = { ...folder, ...data };
    }
  };

  socket.off("cover-update", onCoverUpdate);
  socket.on("cover-update", onCoverUpdate);

  const save = async () => {
    if (hasChanges) {
      if (!folder.Name) {
        return (error = "Name Can't be empty");
      }
      socket.emit("file-work", { action: "renameDBFolder", data: { ...folder, Transfer: transfer } });
      hasChanges = false;
      old = { ...folder };
      transfer = false;
    }
    if (/^http/.test(imageData.Url)) {
      setMessage({ msg: "Updatng Cover Please Wait" });
      socket.emit("download-server", {
        action: "Create-Cover",
        datas: { Id: folderId, imgUrl: imageData.Url },
      });
    }

    if (imageData.file) {
      const { file } = imageData;
      setMessage({ msg: "Sending File Please Wait: " + imageData.file.type });
      socket.emit("file-work", { action: "createFolderThumb", data: { folderId, file } });
    }
  };

  $: loadDetails(folderId);
  $: isModified = hasChanges || imageData.Url || imageData.file;
</script>

<div class="detail" class:change={isModified}>
  <div class="error">{error || ""}</div>
  <div class="file-header">
    <TextAreaInput file={folder} key="Name" style="margin-bottom: 5px" rows="3" {onChange}>
      <span class="pre-paste" slot="btn-left" on:click={copyName} title="Copy Name">
        <Icons name="copy" color="#045cba" />
      </span>
    </TextAreaInput>
    <div class="header">
      <div class="f-image">
        <div>
          <img src={`${encodeURI(`/Folder/${folder.FilesType}/${folder.Name}.jpg?v=${time}`)}`} alt="Not Found" />
        </div>
      </div>
      <div class="f-count" on:click={loadFromDisk}>
        <span class="ccount"><strong>Size:</strong> <span>{getSize3(folder)}</span></span>
        <div class="sept">Info From Disk</div>
        <span class="ccount">
          <strong>Files Count:</strong> <span>{folder.FileCount || 0}</span>
        </span>
        <span class="ccount">
          <strong>Total In Disk:</strong> <span>{folder.Total || "Click to Reload"}</span>
        </span>
        <span class="ccount"><strong>Last Chapter: </strong><span> {folder.Last || "N/A"}</span></span>
      </div>
    </div>
  </div>
  <div class="d-content">
    <TextAreaInput file={folder} key="AltName" style="margin-bottom: 5px" sept="; " rows="3" {onChange}>
      <span class="pre-paste" slot="btn-left" on:click={prePaste} title="Paste To The Left">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
    <TextAreaInput file={folder} key="Genres" style="margin-bottom: 5px" rows="2" sept="," {onChange} />
    <TextAreaInput file={folder} key="Description" rows="4" {onChange} />
    <Input label="Author(s)/Artist(s)" key="Author" item={folder} {onChange} sept=", " />
    <Input key="Server" item={folder} {onChange}>
      <span slot="icon" class="server-link">
        Server
        {#if /^http/.test(folder.Server)}
          <a href={folder.Server} target="_blank" on:click|stopPropagation>
            <Icons name="world" color="black" />
          </a>
        {/if}
      </span>
    </Input>
    <Input label="Emission Date" type="date" key="EmissionDate" item={folder} {onChange} />
    <CheckBox label="Completed" key="Status" item={folder} {onChange} />
    <CheckBox label="Is Adult" key="IsAdult" item={folder} {onChange} />
    <CheckBox key="transfer" item={{ transfer }} onChange={() => (transfer = !transfer)} />
    {#if transfer}
      <Select label="Directories" key="DirectoryId" {options} item={folder} {onChange} />
    {/if}
    <Input key="Url" item={imageData} onChange={onUrl} />
  </div>
</div>
{#if isModified}
  <div class="d-buttons">
    <button type="button" class="btn primary" on:click={save}>Save</button>
    <button type="button" class="btn" on:click={cancel}>Cancel</button>
  </div>
{/if}

<style>
  .detail {
    position: relative;
    height: calc(100% - 50px);
    overflow-y: auto;
  }
  .detail.change {
    height: calc(100% - 90px);
  }
  .header {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 5px 0;
    background-color: black;
    border-radius: 0.25rem;
    height: 244px;
    overflow: hidden;
  }
  .header img {
    object-fit: contain;
    max-height: 100%;
    max-width: 100%;
  }

  img {
    position: relative;
    color: transparent;
  }

  img[alt] {
    height: 100%;
    width: 100%;
    font-size: 16px;
  }

  img[alt]:after {
    position: absolute;
    left: -1px;
    background-color: rgba(52, 58, 64, 0.99);
    font-family: "Helvetica";
    font-weight: 300;
    content: " ";
    height: 100%;
    width: 100%;
  }
  img[alt]::before {
    content: attr(alt);
    position: absolute;
    top: 45%;
    left: 25%;
    color: white;
    z-index: 9;
  }
  .f-image {
    min-width: 175px;
    padding: 4px;
  }
  .f-image div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
    border-radius: 0.3rem;
  }
  .f-image {
    object-fit: contain;
  }
  .f-count {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
    color: white;
    font-weight: 600;
    width: 100%;
  }
  .sept {
    text-align: center;
    font-weight: bold;
    border-bottom: 2px solid white;
  }
  .sept + .ccount {
    cursor: pointer;
  }
  .f-count > span {
    display: inline-block;
    width: 100%;
    padding: 4px 3px;
  }

  .f-count span:not(:last-child) {
    border-bottom: 2px solid rgba(66, 66, 66, 0.4);
  }

  .f-count strong {
    display: inline-block;
    margin-right: 5px;
    min-width: 40px;
  }

  .detail :global(.input-label) {
    min-width: 120px;
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
  .pre-paste {
    position: absolute;
    left: 5px;
  }
  .server-link {
    display: inline-block;
    position: relative;
    width: 100%;
  }
  .server-link a {
    position: absolute;
    top: -1px;
    right: -4px;
  }
  .file-header {
    display: flex;
    flex-direction: column-reverse;
  }
  @media screen and (max-height: 810px) {
    .detail {
      padding-bottom: 15px;
    }
  }
  @media screen and (min-width: 1100px) {
    .file-header {
      flex-direction: row;
    }
    .file-header :global(.input-control) {
      height: 100%;
      max-width: 300px;
      width: 70%;
      padding: 4px;
    }
    .detail .file-header :global(textarea) {
      height: 211px;
    }
  }
</style>
