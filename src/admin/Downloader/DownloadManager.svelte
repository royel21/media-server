<script>
  import { navigate } from "svelte-routing";
  import Icons from "src/icons/Icons.svelte";
  import Downloads from "./Downloads.svelte";
  import Downloading from "./Downloading.svelte";
  export let tab = "downloads";

  const components = {
    downloads: Downloads,
    downloading: Downloading,
  };

  $: {
    navigate(`/admin/downloads/${tab || "downloads"}`, { replace: true });
  }
  document.title = "Manager";
</script>

<div class="card bg-dark text-light admin-manager">
  <div class="disk-controls">
    <div class="usn nav nav-tabs">
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="downloads" id="tab1" />
        <label class="nav-link" for="tab1">
          <Icons name="download" />
          <span id="disks">Downloads</span>
        </label>
      </div>
      <div class="nav-item">
        <input type="radio" bind:group={tab} value="downloading" id="tab2" />
        <label class="nav-link" for="tab2">
          <Icons name="folder" />
          <span id="dirs">Downloading</span>
        </label>
      </div>
    </div>
  </div>
  <div id="tabs-content">
    <svelte:component this={components[tab]} />
  </div>
</div>
