<script>
  import apiUtils from "src/apiUtils";
  import { onMount } from "svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  export let hide;
  export let acept;
  export let data = "";

  let errors = [];
  let Directories = [];

  let current = {};

  onMount(async () => {
    const data = await apiUtils.admin(["folders", "dirs"]);
    if (data.dirs?.length) {
      Directories = data.dirs.filter((d) => d.Type === "Videos");
      current = Directories[0];
    }
  });

  const onConfirm = () => {
    errors = [];
    if (!current?.Id) {
      return errors.push("Not Directory Selected");
    }
    acept({ folder: data, DirectoryId: current.Id });
    hide();
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h5 slot="modal-header">
    <p>Move Folder <span>"{data.Name}"</span></p>
  </h5>
  <span slot="modal-body" class="dir-list">
    <div><span>Select Directory</span></div>
    <select class="form-control" bind:value={current}>
      {#each Directories as dir}
        <option value={dir}>{dir.FullPath}</option>
      {/each}
    </select>
  </span>
</Dialog>

<style>
  .dir-list div {
    text-align: center;
    font-weight: 600;
  }
  h5 {
    font-size: 1.1rem;
  }
  h5 span {
    color: firebrick;
  }
</style>
