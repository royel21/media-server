<script>
  import { navigate } from "svelte-routing";
  import Tree from "./Tree.svelte";
  import Directories from "./Directories.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Downloads from "./Downloader/Downloads.svelte";
  export let tab = "tab-3";

  const components = {
    "tab-1": Directories,
    "tab-2": Tree,
    "tab-3": Downloads,
  };

  $: {
    navigate(`/admin/content-manager/${tab || "tab-3"}`, { replace: true });
  }
  document.title = "Manager";
</script>

<div class="card bg-dark text-light admin-manager">
  <div class="disk-controls">
    <div class="usn nav nav-tabs">
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="tab-3" id="tab3" />
        <label class="nav-link" for="tab3">
          <Icons name="download" />
          <span id="disks">Downloads</span>
        </label>
      </div>
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="tab-1" id="tab1" />
        <label class="nav-link" for="tab1">
          <Icons name="folder" />
          <span id="dirs">Directories</span>
        </label>
      </div>
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="tab-2" id="tab2" />
        <label class="nav-link" for="tab2">
          <Icons name="hdd" />
          <span id="disks">Server</span>
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

  .admin-manager .disk-controls :global(svg) {
    top: 0px;
    width: 32px;
    height: 24px;
  }

  .disk-controls .nav {
    display: flex;
    justify-content: space-evenly;
    max-width: 440px;
    margin: 0 auto;
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
  #tabs-content {
    position: absolute;
    top: 60px;
    width: 100%;
    height: calc(100% - 62px);
    padding: 5px 8px;
    overflow-y: auto;
  }
</style>
