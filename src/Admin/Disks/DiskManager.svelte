<script>
  import { navigate } from "svelte-routing";
  import Tree from "./Tree.svelte";
  import Directories from "./Directories.svelte";
  import { fly } from "svelte/transition";
  export let tab = "tab-1";
  $: {
    navigate(`/content-manager/${tab || "tab-1"}`, { replace: true });
  }
</script>

<style>
  .admin-manager {
    position: relative;
    height: 100%;
    padding: 10px 0 0 0;
  }
  .nav {
    display: flex;
    justify-content: space-evenly;
    border-bottom: 1px solid;
  }
  .nav-link {
    padding: 5px 10px;
    border-radius: 0.25rem 0.25rem 0 0;
    user-select: none;
  }

  input[type="radio"] {
    display: none;
  }
  .controls.nav label {
    display: inline-block;
    margin: 0;
    cursor: pointer;
    color: white;
  }
  .controls .nav-link .fas {
    font-size: 30px;
  }
  .nav-link span {
    position: relative;
    top: -4px;
    font-size: 20px;
  }
  .nav input[type="radio"]:not(:checked) label:hover {
    background-color: #007bff27;
  }
  .nav input[type="radio"]:checked + label:hover,
  .nav input[type="radio"]:checked + label {
    position: relative;
    font-weight: 600;
    border: 1px solid;
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
    overflow-x: hidden;
  }
</style>

<div class="card bg-dark text-light admin-manager">
  <div class="nav nav-tabs controls">
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-1" id="tab1" />
      <label class="nav-link" for="tab1">
        <i class="fas fa-folder" />
        <span id="dirs">Directories</span>
      </label>
    </div>
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-2" id="tab2" />
      <label class="nav-link" for="tab2">
        <div class="fas fa-hdd" />
        <span id="disks">Server</span>
      </label>
    </div>
  </div>
  {#if tab.includes('tab-1')}
    <div
      id="tabs-content"
      in:fly={{ y: 200, duration: 200 }}
      out:fly={{ y: 200, duration: 200 }}>
      <Directories />
    </div>
  {:else}
    <div
      id="tabs-content"
      in:fly={{ y: 200, duration: 200 }}
      out:fly={{ y: 200, duration: 200 }}>
      <Tree />
    </div>
  {/if}
</div>
