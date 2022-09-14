<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let config = {};
  export let ToggleMenu;
  let show = false;
  let width = "";
  let tWidth = config.width;
  let imgAbjust = config.imgAbjust || "";

  const blur = () => {
    width = "";
  };
  const focus = () => {
    width = config.width;
  };

  let change = () => {
    tWidth = width < 30 ? 30 : width > 100 ? 100 : width;
    width = tWidth;
    localStorage.setItem("mWidth", width);
  };

  $: dispatch("mconfig", { width: tWidth, imgAbjust });
  $: if ($ToggleMenu) {
    show = false;
  }
</script>

<label for="show"> <i class="fas fa-cog" /></label>
<input type="checkbox" name="show-config" id="show" bind:checked={show} />
<div id="content" class:show on:click|stopPropagation|preventDefault>
  <div class="input-group">
    <div class="input-group-prepend"><label for="img-fill" class="input-group-text">Ajust Image:</label></div>
    <select id="img-fill" name="image-fill" class="form-control" bind:value={imgAbjust}>
      <option value="fill">fill</option>
      <option value="cover">cover</option>
      <option value="contain">contain</option>
    </select>
  </div>
  <div class="input-group">
    <div class="input-group-prepend"><label for="img-width" class="input-group-text">Width</label></div>
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
      placeholder={config.width + "%"}
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
    max-height: 32px;
  }
  .input-group {
    margin-bottom: 5px;
  }
  label {
    width: 110px;
    position: relative;
  }
  .fas {
    font-size: 25px;
    transition: 0.05s all;
  }
</style>
