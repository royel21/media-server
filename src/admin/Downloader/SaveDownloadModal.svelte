<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "../Component/Input.svelte";
  import apiUtils from "src/apiUtils";

  export let hide;
  export let links = [];
  export let downloads = { Name: "", links: [] };
  let ref;
  let error = "";

  const save = async () => {
    if (downloads.Name) {
      const result = await apiUtils.post("admin/downloader/save-downloads", downloads);
      if (!result.error) {
        return hide();
      }
      error = result.error;
    } else {
      error = "Name can't be empty";
    }
  };

  onMount(() => {
    downloads.links = links.map((lnk) => ({ LinkId: lnk.Id }));
  });
</script>

<div bind:this={ref} class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Create Download List</h4>
    </div>
    <form action="#" on:submit|preventDefault={save}>
      <div class="modal-body">
        <Input key="Name" item={downloads} />
      </div>
      <div class="error">{error || ""}</div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click={hide}>Cancel</button>
        <button type="submit" class="btn">Create</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 310px;
    outline: none;
  }
  .modal-container :global(.input-control) {
    margin-bottom: 5px;
  }
  .modal-container :global(.input-label) {
    padding-left: 0.35rem;
    text-align: left;
  }
</style>
