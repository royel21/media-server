<script>
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";
  import { getImageFromNav } from "../Component/util";
  import Games from "../Store/GameStore";

  export let game = {};

  let def = {
    Name: "",
    Codes: "",
    Company: "",
    AltName: "",
    Description: "",
    Image: {},
  };
  let data = { ...def };

  let files;

  const save = async () => {
    if (!data.Id) return setMessage("Not Game Selected");
    const result = await apiUtils.post("admin/games/update-game-info", data, "up-data");
    if (result.error) {
      return setMessage({ msg: result.error });
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
    game.Info.Description = result.Description;

    const games = { ...$Games };
    let index = games.findndex((g) => g.Id === game.Id);
    games[index] = game;
    Games.set(games);

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
      await apiUtils.post("admin/games/upload-game-image", { file, Id: data.Id }, "u-img");
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

  $: if (game.Id !== data.Id) {
    data = game.Id
      ? {
          Id: game.Id,
          Name: game.Name || "",
          Path: game.Path || "",
          Codes: game.Codes || "",
          Company: game.Info?.Company || "",
          AltName: game.Info?.AltName || "",
          Description: game.Info?.Description || "",
          Image: {},
        }
      : { ...def };
    getImage(data.Id);
  }
</script>

<div id="folder-data" class="file-list col-6">
  <div class="name-img">
    {#if data.Id}
      <div class="info-cover">
        <label class={`${data.Image.data ? "" : "info-load-img"}`} on:contextmenu={handlerImg}>
          {#if data.Image?.data}
            <img src={`data:img/jpeg;base64, ${data.Image.data || ""}`} alt="" />
          {:else}
            <p>Left click to select image</p>
            <p>Right click to paste image</p>
          {/if}
          <input id="single" type="file" accept="image/*" bind:files on:change={onImageLoaded} />
        </label>
      </div>
    {/if}
    <div class="info-item info-name">
      <span>Name</span>
      <textarea class="form-control" bind:value={data.Name}></textarea>
    </div>
  </div>

  <div>
    <span>Codes</span>
    <input class="form-control" bind:value={data.Codes} />
  </div>
  <div>
    <span>Company</span>
    <input class="form-control" bind:value={data.Company} />
  </div>
  <div class="info-item info-altname">
    <span>Alt Name</span>
    <textarea class="form-control" rows="3" bind:value={data.AltName}></textarea>
  </div>
  <div class="info-item info-desc">
    <span>Description</span>
    <textarea class="form-control" bind:value={data.Description}></textarea>
  </div>
  <div class="info-item info-path">
    <span>Path</span>
    <textarea class="form-control" rows="2" bind:value={data.Path}></textarea>
  </div>
  {#if data.Id}
    <div class="info-controls">
      <button class="btn" on:click={save}>Save Info</button>
    </div>
  {/if}
</div>

<style>
  #folder-data {
    flex-grow: 1;
    position: relative;
    border-left: 1px solid;
    width: 50%;
    height: 100%;
    overflow: auto;
    min-width: 400px;
    padding: 0 5px;
  }
  .name-img {
    display: flex;
    flex-direction: row;
  }
  .info-cover {
    max-width: 50%;
    margin: 5px;
  }
  .info-cover label {
    width: 100%;
  }
  img {
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
    margin-bottom: 5px;
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
    text-align: center;
    padding-bottom: 5px;
  }
  .info-name {
    min-height: 100%;
  }
  .info-altname {
    max-height: 180px;
  }
  .info-altname,
  .info-desc {
    min-height: 60px;
  }

  .info-path {
    flex-grow: 0;
    height: 65px;
  }

  textarea {
    line-height: 1.14;
  }
</style>
