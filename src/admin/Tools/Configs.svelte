<script>
  import { navigate } from "svelte-routing";
  import Icons from "src/icons/Icons.svelte";
  import Tools from "./Tools.svelte";
  import Tags from "./Tags.svelte";
  export let tab = "tab-1";

  const components = {
    "tab-1": Tools,
    "tab-2": Tags,
  };

  $: {
    navigate(`/admin/configs/${tab || "tab-1"}`, { replace: true });
  }
  document.title = "Configs";
</script>

<div class="card bg-dark text-light admin-manager">
  <div class="disk-controls">
    <div class="usn nav nav-tabs">
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="tab-1" id="tab1" />
        <label class="nav-link" for="tab1">
          <Icons name="tools" />
          <span id="cogs">Tools</span>
        </label>
      </div>
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="tab-2" id="tab2" />
        <label class="nav-link" for="tab2">
          <Icons name="tags" />
          <span id="dirs">Tags</span>
        </label>
      </div>
    </div>
  </div>
  <div id="tabs-content">
    <svelte:component this={components[tab]} />
  </div>
</div>

<style>
  .admin-manager {
    position: relative;
    height: 100%;
    padding: 10px 0 0;
  }
  .disk-controls {
    border-bottom: 1px solid;
  }
  label span {
    display: none;
  }
  input:checked label span {
    display: inline-block;
  }

  .admin-manager .disk-controls :global(svg) {
    top: 0px;
    width: 32px;
    height: 24px;
  }

  .nav-link {
    padding: 5px 10px;
  }

  input[type="radio"] {
    display: none;
  }
  .usn.nav label {
    display: inline-block;
    margin: 0;
    cursor: pointer;
    color: white;
  }
  .nav-link span {
    position: relative;
    top: -4px;
    font-size: 14px;
  }
  .nav input[type="radio"]:not(:checked) label:hover {
    background-color: #007bff27;
  }
  .nav input[type="radio"]:checked + label:hover,
  .nav input[type="radio"]:checked + label {
    position: relative;
    font-weight: 600;
    border: 1px solid;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    border-bottom: transparent;
  }
  .nav input[type="radio"]:checked + label:after {
    position: absolute;
    content: " ";
    bottom: -1px;
    left: 0;
    height: 1px;
    width: 100%;
    background-color: #343a40 !important;
  }
  input[type="radio"]:checked + label span {
    display: inline-block;
  }
</style>
