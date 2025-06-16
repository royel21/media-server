<script>
  import Icons from "src/icons/Icons.svelte";
  import { clamp } from "src/ShareComponent/utils";
  import { ConfigStore, updateConfig } from "src/user/Stores/PageConfigStore";
  export let ToggleMenu;

  const config = { ...$ConfigStore };

  let show = false;
  let width = "";

  const blur = () => {
    width = "";
  };
  const focus = () => {
    width = config.Viewer.manga.width;
  };

  let change = ({ target: { value } }) => {
    config.Viewer.manga.width = clamp(value, 30, 100);
  };

  $: if ($ToggleMenu) show = false;
  $: updateConfig(config);
</script>

<label class="config-icon" for="show"><Icons name="cog" /></label>
<input type="checkbox" name="show-config" id="show" bind:checked={show} />
<div id="content" class:show on:click|stopPropagation|preventDefault>
  <div class="input-group">
    <div class="input-group-prepend">
      <label for="img-fill" class="input-group-text">Ajust Image</label>
    </div>
    <select id="img-fill" name="image-fill" class="form-control" bind:value={config.Viewer.manga.imgAbjust}>
      <option value="fill">fill</option>
      <option value="cover">cover</option>
      <option value="contain">contain</option>
    </select>
  </div>
  <div class="input-group">
    <div class="input-group-prepend">
      <label for="img-width" class="input-group-text">Image Width</label>
    </div>
    <input
      id="img-width"
      name="img-width"
      type="number"
      min="30"
      max="100"
      on:blur={blur}
      on:focus={focus}
      on:change={change}
      on:keydown|stopPropagation
      class="form-control"
      bind:value={width}
      placeholder={config.Viewer.manga.width + "%"}
    />
  </div>
</div>

<style>
  input[type="checkbox"]:not(#from-start) {
    display: none;
  }
  #content {
    visibility: hidden;
    position: absolute;
    bottom: -30px;
    left: -101px;
    width: 230px;
    background-color: #14243d;
    height: max-content;
    padding: 5px;
    border-radius: 0.25rem;
    pointer-events: none;
    transform: scaleX(0) scaleY(0) translateY(0);
    transition: 0.3s all;
  }
  #content.show {
    visibility: visible;
    pointer-events: all;
    transform: scaleX(1) scaleY(1) translateX(-103px) translateY(-66px);
  }

  #content input::-webkit-outer-spin-button,
  #content input::-webkit-inner-spin-button {
    -webkit-appearance: initial;
    margin: 0;
  }
  #content * {
    height: 32px;
  }
  .input-group {
    margin-bottom: 5px;
  }
  label {
    width: 105px;
    position: relative;
  }
</style>
