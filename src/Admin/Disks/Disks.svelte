<script>
  import Tree from "./Tree.svelte";
  import Directories from "./Directories.svelte";
  let tab = "tab-1";
</script>

<style>
  #d-manager {
    height: 100%;
    padding: 10px 0 0 0;
  }
  .nav {
    display: flex;
    justify-content: space-evenly;
    border-bottom: 1px solid;
  }
  .nav-link {
    padding: 5px;
    border-radius: 0.25rem 0.25rem 0 0;
  }

  input[type="radio"] {
    display: none;
  }
  .controls.nav label {
    display: inline-block;
    margin: 0;
    border-bottom: 1px solid;
    cursor: pointer;
    padding-bottom: 0.2rem;
  }
  .controls .nav-link .fas {
    font-size: 30px;
  }
  .controls.nav label:hover {
    background-color: #007bff27;
  }
  .nav input[type="radio"]:checked + label:hover,
  .nav input[type="radio"]:checked + label {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
    border: 1px solid;
  }
  input[type="radio"]:checked + label span {
    display: inline-block;
    border-bottom: 1px solid;
    padding-bottom: 2px;
  }
  #tabs-content {
    height: 100%;
    padding: 0 8px;
    overflow-y: auto;
  }
</style>

<div id="d-manager" class="card bg-dark text-light manager">
  <div class="nav nav-tabs controls">
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-1" id="tab1" />
      <label class="nav-link" for="tab1">
        <i class="fas fa-folder" />
        <span id="dirs">Directory List</span>
      </label>
    </div>
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-2" id="tab2" />
      <label class="nav-link" for="tab2">
        <div class="fas fa-hdd" />
        <span id="disks">Server Disks</span>
      </label>
    </div>
  </div>
  <div id="tabs-content">
    {#if tab.includes('tab-1')}
      <Directories />
    {:else}
      <Tree />
    {/if}
  </div>
</div>
