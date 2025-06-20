<script>
  import { getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { isDiff, formatSize } from "../Utils";
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
      tags = data.tags.filter((g) => !g.IsRemove).map((g) => g.Name);
      removeTags = data.tags.filter((g) => g.IsRemove).map((g) => g.Name);
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
    folder = { ...old };
    imageData = {};
    hasChanges = false;
  };

  const onCoverUpdate = (result) => {
    if (result.Id === folderId) {
      if (result.valid) {
        imageData.Url = "";
        imageData.file = "";
        setMessage({ msg: `Cover for: ${folder.Name} was updated` });
      } else {
        setMessage({ error: true, msg: `Could't get the image from Url: ${imageData.Url}` });
      }
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
  <div class="f-count">
    <span class="ccount">Total: {folder.Total || 0}</span>
    <span class="ccount">Size: {formatSize(folder.Size || 0)}</span>
  </div>
  <div class="last-file"><strong>Last Chapter: </strong><span> {folder.Last || "N/A"}</span></div>
  <div class="d-content">
    <TextAreaInput file={folder} key="Name" style="margin-bottom: 5px" rows="3" {onChange}>
      <span class="pre-paste" slot="btn-left" on:click={copyName} title="Copy Name">
        <Icons name="copy" color="#045cba" />
      </span>
    </TextAreaInput>
    <TextAreaInput file={folder} key="AltName" style="margin-bottom: 5px" sept="; " rows="3" {onChange}>
      <span class="pre-paste" slot="btn-left" on:click={prePaste} title="Paste To The Left">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
    <TextAreaInput file={folder} key="Genres" style="margin-bottom: 5px" rows="2" sept="," {onChange} />
    <TextAreaInput file={folder} key="Description" rows="4" {onChange} />
    <Input key="Author" item={folder} {onChange} sept=", " />
    <Input key="Server" item={folder} {onChange}>
      <span slot="icon" class="server-link">
        Server
        {#if /^http/.test(folder.Server)}
          <a href={folder.Server} target="_blank">
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
  .f-count {
    display: flex;
    font-size: 0.9rem;
    margin: 5px 0;
    background-color: #0db9d8;
    border-radius: 0.25rem;
    color: black;
    font-weight: 600;
  }

  .f-count span {
    width: 50%;
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
  .f-count .ccount {
    min-width: 85px;
    text-align: center;
    border-right: 1px solid white;
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
  @media screen and (max-height: 810px) {
    .detail {
      padding-bottom: 15px;
    }
  }
</style>
