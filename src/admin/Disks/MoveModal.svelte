<script>
  import apiUtils from "src/apiUtils";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  export let hide;
  export let acept;
  export let data = "";
  let Directories = [];
  let ref;

  let current = {};

  onMount(async () => {
    const data = await apiUtils.admin(["folders", "dirs"]);
    if (data?.length) {
      Directories = data.filter((d) => d.Type === "Videos");
      current = Directories[0];
    }
    ref?.focus();
  });

  const onConfirm = () => {
    acept({ folder: data, DirectoryId: current.Id });
    hide();
  };
</script>

<div bind:this={ref} class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Move Folder to Directory</h4>
    </div>

    <div class="modal-body">
      <span class="dir-list">
        <span>Select Directory: </span>
        <select class="form-control" bind:value={current}>
          {#each Directories as dir}
            <option value={dir}>{dir.FullPath}</option>
          {/each}
        </select>
      </span>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn" on:click={onConfirm}>Ok</button>
      <button type="button" class="btn" on:click={hide}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal {
    width: 400px;
    outline: none;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
  }
</style>
