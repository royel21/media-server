<script>
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";
  import { getImageFromNav } from "../Component/util";
  import { getContext, onDestroy, onMount } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";

  export let game = {};
  export let updateGame;
  export let removeGame;

  const socket = getContext("socket");

  let def = {
    Name: "",
    Codes: "",
    Company: "",
    AltName: "",
    Description: "",
    Image: {},
  };
  let data = { ...def };
  let removing = false;
  let showGList = false;
  let showGList2 = false;
  let files;
  let listRef;
  let showImage = false;

  const save = async () => {
    if (!data.Name) return setMessage({ msg: "Name Required", error: true });
    if (!data.Codes) return setMessage({ msg: "Game Code Required", error: true });

    const result = await apiUtils.post("admin/games/update-game-info", { ...data, Image: "" }, "up-data");
    if (result.error) {
      return setMessage({ msg: result.error, error: true });
    }

    if (!game.Info) {
      game.Info = {};
    }
    data = { ...result, Image: data.Image };

    game.Name = result.Name;
    game.Path = result.Path;
    game.Codes = result.Codes;
    game.Info.Company = result.Company;
    game.Info.AltName = result.AltName;
    game.Info.Lang = result.Lang;
    game.Info.Genres = result.Genres;
    game.Info.Description = result.Description;
    updateGame(game);

    setMessage({ msg: "Game info saved." });
  };

  const getImage = async (Id) => {
    const result = await apiUtils.post("admin/games/get-game-image", { Id }, "g-img");

    data.Image.data = result.image || "";
  };

  const uploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      data.Image = { type: file.type, data: base64 };
      await apiUtils.postFile("admin/games/upload-game-image", { file, Id: data.Id }, "u-img");
    };
    reader.readAsDataURL(file);
  };

  const onImageLoaded = async () => {
    if (files && files.length > 0) {
      const file = files[0];
      uploadFile(file);
    }
  };

  const handlerImg = async (e) => {
    if (!game.Codes) {
      return setMessage({ msg: "Error: Set Code First" });
    }

    try {
      const image = await getImageFromNav();
      if (image !== undefined) {
        uploadFile(image);
      }
    } catch (error) {}
  };

  const onRemove = () => {
    if (removing) {
      return setMessage({ msg: `Game ${game.Name} is being Removed please wait until is finish`, error: true });
    }
    removing = true;
    if (!game.Path) {
      removing = false;
      return removeGame(game);
    }
    setMessage({ msg: `removing ${game.Name} Please Wait`, error: true });
    socket.emit("file-work", { action: "removeDFolder", data: game });
  };

  const onRemoved = async (data) => {
    if (data.folder.Id === game.Id) {
      removing = false;
      if (data.error) {
        return setMessage(data);
      }

      await removeGame(data.folder);
    }
  };
  socket.off("folder-remove", onRemoved);
  socket.on("folder-remove", onRemoved);

  const onShowGList = (e) => {
    showGList = !showGList;
    showGList2 = false;
    e.stopPropagation();
  };

  const onShowGList2 = (e) => {
    showGList2 = !showGList2;
    showGList = false;
    e.stopPropagation();
  };

  const onGSelect = (e) => {
    if (e.target.tagName !== "SPAN") return;
    const g = e.target.textContent;
    const isRange = e.target.parentElement.id === "range";

    let glist = (data.Genres || "").split(", ").filter((f) => f);

    if (glist.includes(g)) {
      data.Genres = glist.filter((f) => f !== g).join(", ");
      return e.stopPropagation();
    }

    if (isRange) {
      glist = e.target.title.split(", ");
    }

    const genres = new Set(glist);

    if (!isRange) {
      genres.add(g);
    }
    data.Genres = [...genres].sort().join(", ");
    e.stopPropagation();
  };

  const onHandlerGList = ({ target }) => {
    if (listRef !== target) {
      showGList = false;
      showGList2 = false;
    }
  };

  const handlerPaste = async ({ currentTarget: { id } }) => {
    let text = await navigator.clipboard?.readText();
    if (text && id) {
      data[id] = text.trim();
    }
  };

  const copyName = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(game.Name + " " + game.Codes);
    }
  };

  onDestroy(() => {
    socket.off("folder-remove", onRemoved);
    document.removeEventListener("click", onHandlerGList);
  });
  onMount(() => {
    document.addEventListener("click", onHandlerGList);
  });

  $: if (game.Id !== data.Id) {
    data = game.Id
      ? {
          Id: game.Id,
          Name: game.Name || "",
          Path: game.Path || "",
          Codes: game.Codes || "",
          Company: game.Info?.Company || "",
          AltName: game.Info?.AltName || "",
          Lang: game.Info?.Lang || "",
          Genres: game.Info?.Genres || "",
          Description: game.Info?.Description || "",
          Image: {},
        }
      : { ...def };
    getImage(data.Id);
  }

  $: isNew = data.Id !== "new";
  $: if (data.AltName) {
    data.AltName = data.AltName?.replace("–", "-").replace(/\?|\:/g, "").replace(/( )+/g, " ").replaceAll("’", "'");
  }
  $: if (data.Codes && /^\d+/.test(data.Codes)) {
    data.Codes = "ST" + data.Codes;
  }
</script>

{#if showImage && data.Image.data}
  <Dialog id="c-img" canDrag={true} btnCancer="" btnOk="" cancel={() => (showImage = false)}>
    <img src={`data:img/jpeg;base64, ${data.Image.data || ""}`} alt="" />
  </Dialog>
{/if}

<div id="folder-data" class="file-list col-6">
  <div class="g-info-controls">
    <div class="name-img">
      {#if data.Id}
        <div class="info-cover">
          <div class={`c-img ${data.Image.data ? "" : "info-load-img"}`} on:click={() => (showImage = true)}>
            {#if data.Image?.data}
              <img src={`data:img/jpeg;base64, ${data.Image.data || ""}`} alt="" />
            {:else}
              <p>Image Placeholder</p>
            {/if}
          </div>
          <span class="paste" on:click={handlerImg}><Icons name="paste" /></span>
          <label class="upload">
            <Icons name="upload" />
            <input id="single" type="file" accept="image/*" bind:files on:change={onImageLoaded} />
          </label>
        </div>
      {/if}
      <div class="info-item info-name">
        <span><span id="Name" on:click={handlerPaste}><Icons name="paste" /></span>Name</span>
        <textarea class="form-control" bind:value={data.Name}></textarea>
        <span class="gn-copy" on:click={copyName}><Icons name="paste" color="deepskyblue" /></span>
      </div>
    </div>

    <div>
      <span><span id="Codes" on:click={handlerPaste}><Icons name="paste" /></span>Codes</span>
      <input class="form-control" bind:value={data.Codes} />
    </div>
    <div>
      <span><span id="Company" on:click={handlerPaste}><Icons name="paste" /></span>Publisher/Dev</span>
      <input class="form-control" bind:value={data.Company} />
    </div>
    <div class="info-item info-altname">
      <span><span id="AltName" on:click={handlerPaste}><Icons name="paste" /></span>Alt Name</span>
      <textarea class="form-control" rows="3" bind:value={data.AltName}></textarea>
    </div>
    <div>
      <span><span id="Lang" on:click={handlerPaste}><Icons name="paste" /></span>Lang</span>
      <input class="form-control" bind:value={data.Lang} />
    </div>
    <div class="gen" bind:this={listRef}>
      <span class="show-gen-list" on:click={onShowGList}>:</span>
      {#if showGList}
        <div class="g-list-container">
          <div class="g-list" on:click={onGSelect}>
            <span>3D</span>
            <span>Action</span>
            <span>Adventure</span>
            <span>Animated</span>
            <span>Chikan</span>
            <span>Drama</span>
            <span>Harem</span>
            <span>Incest</span>
            <span>Loli</span>
            <span>Maid</span>
            <span>Mind Control</span>
            <span>Mistery</span>
            <span>NTR</span>
            <span>Pervert</span>
            <span>Romance</span>
            <span>Rape</span>
            <span>RPG</span>
            <span>School</span>
            <span>Sleep Sex</span>
            <span>SLG</span>
            <span>Simulation</span>
            <span>Teacher</span>
            <span>Touching</span>
            <span>Unity</span>
            <span>VN</span>
          </div>
        </div>
      {/if}
      <span class="show-gen-list2" on:click={onShowGList2}>:</span>
      {#if showGList2}
        <div class="g-list-container g-list2">
          <div id="range" class="g-list" on:click={onGSelect}>
            <span title="Drama, School, VN">DSV</span>
            <span title="Drama, VN">DV</span>
            <span title="Drama, NTR, VN">DNV</span>
            <span title="Drama, Harem, NTR, VN">DHNV</span>
            <span title="Drama, Harem, School, VN">DHSV</span>
            <span title="Harem, Loli, School, VN">HSV</span>
            <span title="Harem, School, VN">HSV</span>
            <span title="Harem, Romance, School, VN">HRSV</span>
            <span title="Harem, School, VN">HSV</span>
            <span title="Harem, Romance, VN">HRV</span>
            <span title="Harem, VN">HV</span>
            <span title="Harem, NTR, VN">HNV</span>
            <span title="NTR, VN">NV</span>
            <span title="Romance, VN">RV</span>
            <span title="RPG, School">RS</span>
            <span title="School, VN">SV</span>
            <span title="Rape, School, VN">RapeSV</span>
            <span title="Romance, School, VN">RSV</span>
          </div>
        </div>
      {/if}
      <span>Genres</span>
      <input class="form-control" bind:value={data.Genres} />
    </div>
    <div class="info-item info-desc">
      <span>Description</span>
      <textarea class="form-control" bind:value={data.Description}></textarea>
    </div>
    <div class="info-item info-path">
      <span>Path</span>
      <textarea class="form-control" rows="2" bind:value={data.Path}></textarea>
    </div>
  </div>
  {#if data.Id}
    <div class="info-controls">
      <button class="btn" on:click={save}>{isNew ? "Update" : "Create"}</button>
      {#if isNew}
        <button class="btn danger" on:click={onRemove}>Remove Game</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  #folder-data {
    flex-grow: 1;
    position: relative;
    border-left: 1px solid;
    width: 50%;
    min-width: 330px;
    padding: 0 5px;
  }
  .g-info-controls {
    display: flex;
    flex-direction: column;
    height: calc(100% - 40px);
    overflow: auto;
  }
  .name-img {
    display: flex;
    flex-direction: row;
  }
  :global(#c-img) {
    width: initial;
    height: initial;
  }
  :global(#c-img .modal-body) {
    padding: 2px;
  }
  :global(#c-img) img {
    max-height: 450px;
    max-width: 100%;
  }
  .info-cover {
    position: relative;
    max-width: 50%;
    min-width: 130px;
    margin: 0 4px;
  }
  .info-cover .c-img {
    width: 100%;
  }
  .info-cover img {
    max-height: 250px;
    max-width: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto 0px auto;
  }

  .info-load-img {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #ccc;
    color: #888;
    font-size: 14px;
    cursor: pointer;
  }
  .info-cover input {
    display: none;
  }

  label {
    display: flex;
    flex-direction: column;
    margin-right: 5px;
  }

  #folder-data {
    display: flex;
    flex-direction: column;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    flex-grow: 10;
  }
  .info-controls,
  #folder-data textarea,
  #folder-data input {
    flex-grow: 1;
    resize: none;
    padding: 0.15rem 0.25rem;
    font-size: 12px;
  }
  #folder-data .form-control {
    font-size: 12px;
    font-weight: 600;
    font-family: "verdana", sans-serif;
  }
  .info-controls {
    text-align: left;
    padding-bottom: 5px;
  }
  .info-name {
    position: relative;
    min-height: 100%;
  }
  .info-altname {
    max-height: 180px;
  }
  .info-altname,
  .info-desc {
    min-height: 60px;
  }
  .info-controls button {
    margin-right: 10px;
  }
  .info-path {
    flex-grow: 0;
    height: 65px;
  }

  .danger {
    background-image: linear-gradient(-120deg, #ff5b5b, #ff0000, #ed6161);
  }

  textarea {
    line-height: 1.14;
  }
  .gen {
    position: relative;
  }
  .show-gen-list2,
  .show-gen-list {
    display: inline-block;
    height: 20px;
    line-height: 1;
    position: relative;
    top: -2px;
    padding: 0px 8px;
    border-radius: 0.25rem;
    background-color: aqua;
    color: black;
    cursor: pointer;
    user-select: none;
  }
  .show-gen-list2 {
    background-color: rgb(0, 255, 55);
    margin: 0 8px;
  }
  .show-gen-list2:active,
  .show-gen-list:active {
    transform: scale(1.1);
  }
  .g-list {
    z-index: 9;
    display: flex;
    max-height: 340px;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
    background-color: #888;
    border-radius: 0.25rem;
  }
  .g-list-container {
    position: absolute;
    left: 22px;
    bottom: 55px;
    overflow: hidden;
  }
  .g-list-container.g-list2 {
    left: 52px;
  }
  .g-list span {
    padding: 0 5px;
    cursor: pointer;
  }
  .g-list span:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .sub-g {
    position: absolute;
    top: -2px;
    right: 10px;
    color: aqua;
  }
  .paste,
  .upload {
    display: none;
    max-width: 30px;
    text-align: center;
    border-radius: 0.25rem;
    position: absolute;
    bottom: 2px;
    background-color: #888;
    z-index: 9;
    left: 2px;
  }
  .info-cover:hover .paste,
  .info-cover:hover .upload {
    display: inline-block;
  }
  .upload {
    left: 33px;
  }
  .info-cover :global(svg) {
    top: 3px;
    left: 3px;
  }
  .gn-copy {
    position: absolute;
    top: 0px;
    right: 0px;
  }
  @media screen and (max-width: 640px) {
    #folder-data {
      min-width: 400px;
    }
  }
</style>
