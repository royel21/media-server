<script>
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";
  import { getImageFromNav } from "../Component/util";
  import { getContext, onDestroy, onMount } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { getInfo } from "./infoUtil";
  import { sortAsianFirst } from "../Utils.js";

  export let game = {};
  export let updateGame;
  export let removeGame;
  const options = { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" };

  const socket = getContext("socket");

  let def = {
    Name: "",
    Codes: "",
    Company: "",
    AltName: "",
    Description: "",
    Image: {},
    OS: "",
  };
  let data = { ...def };
  let removing = false;
  let lists = {};
  let files;
  let listRef;
  let showImage = false;

  function capitalizeWords(text) {
    if (typeof text !== "string") {
      throw new TypeError("Input must be a string.");
    }

    return text
      .toLowerCase() // Normalize to lowercase first
      .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
    // \b = word boundary, \p{L} = any letter (Unicode-aware)
  }

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
    game.Info.ReleaseDate = result.ReleaseDate;
    game.Info.Os = result.OS;
    updateGame(game);

    setMessage({ msg: "Game info saved." });
  };

  const format = (str) => {
    return str?.replace("–", "-").replace(/\?|\:/g, "").replace(/( )+/g, " ").replaceAll("’", "'") || "";
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

    if (navigator.clipboard) {
      let text = await navigator.clipboard?.readText();
      let result = getInfo(text, data, data.Name);
      data = { ...data, ...result };
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
      return setMessage({
        msg: `Game ${game.Name} is being Removed please wait until is finish`,
        error: true,
      });
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
  const hideLists = () => {
    for (let key in lists) {
      lists[key] = false;
    }
  };

  const onShowGList = (e) => {
    hideLists();
    lists[e.target.id] = !lists[e.target.id];
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
    if (listRef !== target) hideLists();
  };

  const handlerPaste = async ({ currentTarget: { id } }) => {
    let text = await navigator.clipboard?.readText();
    if (text && id) {
      data[id] = format(text.trim());
    }
  };

  const addItem = (item, key, sept = ", ") => {
    let items = new Set(
      data[key]
        .split(sept)
        .map((l) => l.trim())
        .filter((l) => l),
    );

    if (items.has(item)) {
      items.delete(item);
    } else {
      items.add(item);
    }

    data[key] = [...items].sort().join(sept);
  };

  const addOS = ({ target }) => addItem(target.title, "OS");

  const addLang = ({ target }) => addItem(target.title, "Lang");

  const pasteAltName = async () => {
    let text = await navigator.clipboard?.readText();
    const names = new Set([
      ...data.AltName.split("\n")
        .map((g) => g.trim())
        .filter((g) => g),
      ...text
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
    ]);
    data.AltName = sortAsianFirst([...names]).join("\n");
  };

  const copyName = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${data.Name || ""} ${data.Codes || ""}`.trim());
    }
  };
  const copyComp = (e) => {
    const prevEl = e.currentTarget.previousElementSibling;
    if (navigator?.clipboard?.writeText && prevEl?.value) {
      navigator.clipboard.writeText(prevEl.value);
    }
  };

  const sortGenres = () => {
    data.Genres = (data.Genres || "")
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g)
      .sort()
      .join(", ");
  };

  onDestroy(() => {
    socket.off("folder-remove", onRemoved);
    document.removeEventListener("click", onHandlerGList);
  });
  onMount(() => {
    document.addEventListener("click", onHandlerGList);
  });

  $: if (game.Id !== data.Id) {
    if (game.Codes === data.Codes && game.Id === "new") {
      data.Company = game.Info?.Company || "";
      data.AltName = game.Info?.AltName || "";
      data.Lang = game.Info?.Lang || "";
      data.ReleaseDate = game.Info.ReleaseDate || "";
      game.Id = data.Id;
    } else {
      data = game.Id
        ? {
            Id: game.Id,
            Name: game.Name || "",
            Path: game.Path || "",
            Codes: game.Codes || "",
            Company: game.Info?.Company || "",
            AltName: game.Info?.AltName || "",
            Lang: game.Info?.Lang || "Japanese",
            Genres: game.Info?.Genres || "",
            Description: game.Info?.Description || "",
            ReleaseDate: game.Info?.ReleaseDate,
            Image: {},
            OS: game.Info?.OS || "Windows",
          }
        : { ...def };
      getImage(data.Id);
    }
  }

  $: isNew = data.Id !== "new";
  $: data.Company = capitalizeWords(format(data.Company));
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
          <span class="rdate">
            {data.ReleaseDate ? new Date(data.ReleaseDate).toLocaleDateString("en-US", options) : ""}
          </span>
        </div>
      {/if}
      <div class="info-item info-name">
        <span><span id="Name" on:click={handlerPaste}><Icons name="paste" /></span>Name</span>
        <textarea class="form-control" bind:value={data.Name}></textarea>
        <span class="gn-copy" on:click={copyName} title="Append"><Icons name="paste" color="deepskyblue" /></span>
      </div>
    </div>
    <div class="info-item info-altname">
      <span><span id="AltName" on:click={pasteAltName}><Icons name="paste" /></span>Alt Name</span>
      <textarea class="form-control" rows="3" bind:value={data.AltName}></textarea>
    </div>
    <div class="info-item">
      <span><span id="Codes" on:click={handlerPaste}><Icons name="paste" /></span>Codes</span>
      <input class="form-control" bind:value={data.Codes} />
      <span class="gn-copy" on:click={copyComp}><Icons name="paste" color="deepskyblue" /></span>
    </div>
    <div class="info-item">
      <span><span id="Company" on:click={handlerPaste}><Icons name="paste" /></span>Publisher/Dev</span>
      <input class="form-control" bind:value={data.Company} />
      <span class="gn-copy" on:click={copyComp}><Icons name="paste" color="deepskyblue" /></span>
    </div>
    <div class="lang-list">
      <span><span id="Lang" on:click={handlerPaste}><Icons name="paste" /></span>Lang</span>
      <span class="lang-ul" on:click={addLang}>
        <span title="Chinese">CN</span>
        <span title="English">EN</span>
        <span title="Japanese">JP</span>
      </span>
      <input class="form-control" bind:value={data.Lang} />
    </div>
    <div class="gen" bind:this={listRef}>
      <Icons name="paste" /><span>Genres</span>
      <span id="glist1" class="show-gen-list" on:click={onShowGList}
        >:
        {#if lists.glist1}
          <div class="g-list-container">
            <div class="g-list" on:click={onGSelect}>
              <span>3D</span>
              <span>Action</span>
              <span>Adventure</span>
              <span>Animated</span>
              <span>Chikan</span>
              <span>Drama</span>
              <span>Gang Rape</span>
              <span>Harem</span>
              <span>Incest</span>
              <span>Idol</span>
              <span>Loli</span>
              <span>Magic</span>
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
              <span>Shotacon</span>
              <span>Teacher</span>
              <span>Touching</span>
              <span>VN</span>
            </div>
          </div>
        {/if}
      </span>
      <span id="glist2" class="show-gen-list" on:click={onShowGList}>
        :
        {#if lists.glist2}
          <div class="g-list-container g-list2">
            <div id="range" class="g-list" on:click={onGSelect}>
              <span title="Chikan, VN">CV</span>
              <span title="Chikan, Rape, VN">CRV</span>
              <span title="Chikan, School, VN">CSV</span>
              <span title="Chikan, Rape, School, VN">CRSV</span>
              <span title="Drama, VN">DV</span>
              <span title="Drama, Harem, VN">DHV</span>
              <span title="Drama, School, VN">DSV</span>
              <span title="Drama, Harem, School, VN">DHSV</span>
              <span title="Drama, NTR, VN">DNV</span>
              <span title="Drama, Harem, NTR, VN">DHNV</span>
            </div>
          </div>
        {/if}</span
      >
      <span id="glist3" class="show-gen-list" on:click={onShowGList}
        >:
        {#if lists.glist3}
          <div class="g-list-container g-list3">
            <div id="range" class="g-list" on:click={onGSelect}>
              <span title="Harem, Loli, School, VN">HLSV</span>
              <span title="Harem, School, VN">HSV</span>
              <span title="Harem, Romance, School, VN">HRSV</span>
              <span title="Harem, Romance, VN">HRoV</span>
              <span title="Harem, VN">HV</span>
              <span title="Harem, NTR, VN">HNV</span>
              <span title="Gang Rape, VN">GV</span>
              <span title="Gang Rape, School, VN">GSV</span>
              <span title="NTR, VN">NV</span>
              <span title="NTR, Rape, VN">NRaV</span>
              <span title="NTR, School, VN">NSV</span>
              <span title="NTR, Rape, School, VN">NRaSV</span>
              <span title="Rape, VN">RaV</span>
              <span title="Rape, School, VN">RaSV</span>
              <span title="Romance, VN">RoV</span>
              <span title="Romance, School, VN">RoSV</span>
              <span title="School, VN">SV</span>
            </div>
          </div>
        {/if}</span
      >
      <span id="glist5" class="show-gen-list" on:click={onShowGList}>
        :
        {#if lists.glist5}
          <div class="g-list-container g-list4">
            <div id="range" class="g-list" on:click={onGSelect}>
              <span title="Adventure, RPG">AR</span>
              <span title="Loli, RPG">LR</span>
              <span title="Loli, School, RPG">LSR</span>
              <span title="Harem, RPG">HR</span>
              <span title="Harem, Loli, RPG">HLR</span>
              <span title="Harem, Rape, RPG">HRR</span>
              <span title="Harem, NTR, RPG">HNR</span>
              <span title="Harem, NTR, Rape, RPG">HNRR</span>
              <span title="Harem, RPG , School">HRS</span>
              <span title="Harem, Rape, RPG, School">HRRS</span>
              <span title="NTR, RPG">NR</span>
              <span title="NTR, Harem, RPG">NHR</span>
              <span title="NTR, School, RPG">NSR</span>
              <span title="NTR, Rape, RPG">NRR</span>
              <span title="RPG, School">RS</span>
              <span title="Rape, RPG">RR</span>
              <span title="Rape, RPG, School">RRS</span>
              <span title="Pervert, RPG">PR</span>
              <span title="Pervert, RPG, School">PRS</span>
              <span title="RPG, School">RS</span>
            </div>
          </div>
        {/if}</span
      >
      <input class="form-control" bind:value={data.Genres} on:blur={sortGenres} />
    </div>
    <div class="lang-list">
      <span><span id="OS" on:click={handlerPaste}><Icons name="paste" /></span>OS</span>
      <span class="lang-ul oses" on:click={addOS}>
        <span title="Android/Tyranor">A/T</span>
        <span title="Android/JoiPlay">A/J</span>
        <span title="Android/Winlator">A/W</span>
        <span title="Windows">Win</span>
        <span title="Windows 98 SE">W98</span>
        <span title="Windows 7">W7</span>
        <span title="PC98">PC98</span>
      </span>
      <input class="form-control" bind:value={data.OS} />
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
  .rdate {
    position: absolute;
    font-size: 13px;
    right: 1px;
    bottom: 2px;
    background-color: rgba(17, 128, 122, 0.685);
    padding: 2px 4px 0 4px;
    border-top-left-radius: 0.25rem;
  }
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
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
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
    flex-grow: 10;
  }
  .info-altname {
    max-height: 180px;
    flex-grow: 10;
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

  .gen > span {
    position: relative;
  }

  .show-gen-list {
    display: inline-block;
    height: 20px;
    line-height: 1;
    position: relative;
    top: -2px;
    padding: 0px 8px;
    border-radius: 0.25rem;
    background-color: aqua;
    margin: 0 4px;
    color: black;
    cursor: pointer;
    user-select: none;
  }
  .lang-ul span {
    display: inline-block;
    border-radius: 0.25rem;
    background-color: aqua;
    color: black;
    margin: 0 4px;
    padding: 2px;
    width: max-content;
    text-align: center;
    line-height: 1.2;
    cursor: pointer;
    user-select: none;
  }
  .oses {
    display: inline-flex;
    align-items: center;
    justify-content: space-around;
    width: 250px;
    height: 30px;
  }
  .oses span {
    font-size: 12px;
  }

  .g-list {
    z-index: 9;
    display: flex;
    max-height: 300px;
    min-width: 70px;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
    background-color: #888;
    border-radius: 0.25rem;
    user-select: none;
  }
  .g-list-container {
    position: absolute;
    left: 22px;
    bottom: 24px;
    overflow: hidden;
    min-width: max-content;
  }
  .g-list span {
    padding: 2px 6px;
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
