<script>
  import { getContext, onMount } from "svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";

  export let hide;

  let dirs = [];
  const socket = getContext("socket");

  const loadWatchedDirs = async () => {
    const data = await apiUtils.admin(["files", "get-watched-dirs"]);
    if (data.length) {
      dirs = data;
    }
  };

  const scanDir = (data) => {
    socket.emit("file-work", { action: "dirScan", data });
  };

  const removeWDir = async (data) => {
    const result = await apiUtils.admin(["files", "remove-watched-dir", data.Id]);
    if (result.valid) {
      dirs = dirs.filter((d) => d.Id !== data.Id);
    }
  };

  onMount(() => {
    loadWatchedDirs();
  });
</script>

<Dialog cancel={hide} btnOk={false} btnCancer="Close">
  <h3 slot="modal-header">Watch List</h3>
  <div slot="modal-body">
    <ul class="list">
      {#each dirs as dir}
        <li>
          <span class="icon" on:click={() => removeWDir(dir)}><Icons name="trash" /></span>
          <span class="icon" on:click={() => scanDir(dir)}><Icons name="sync" /></span>
          {dir.Path}
        </li>
      {/each}
    </ul>
  </div>
</Dialog>
