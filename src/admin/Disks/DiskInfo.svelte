<script>
  import { afterUpdate, onDestroy } from "svelte";
  export let height;
  export let socket;

  let diskData = [];

  let ref;
  let showDiskInfo = false;

  const onDiskdata = (data) => {
    diskData = data;
  };

  socket.on("disk-loaded", onDiskdata);

  afterUpdate(() => {
    height = ref?.offsetHeight || 39;
  });

  onDestroy(() => {
    socket.off("disk-loaded", onDiskdata);
  });

  $: if (showDiskInfo) {
    socket.emit("load-disks");
  }
</script>

<div class="d-info" bind:this={ref}>
  <input type="checkbox" name="" id="d-info" bind:checked={showDiskInfo} />
  <h4><label for="d-info">{showDiskInfo ? "Hide" : "Show"} Disk Info</label></h4>
  {#if showDiskInfo}
    <table>
      <thead>
        <tr>
          <th class="skip">DisK</th>
          <th>Size</th>
          <th>Free</th>
          <th>Used</th>
        </tr>
      </thead>
      <tbody>
        {#each diskData as { Name, Free, Used, Size }}
          <tr>
            <td class="skip">{Name}</td>
            <td>{Size}</td>
            <td>{Free}</td>
            <td>{Used}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .d-info {
    padding: 5px 8px;
    border-bottom: 1px solid;
  }
  table {
    width: 100%;
  }
  .skip {
    white-space: nowrap;
  }
  th:not(.skip),
  td:not(.skip) {
    text-align: right;
  }
  h4 {
    text-align: center;
    border-bottom: 1px solid white;
    user-select: none;
  }
  #d-info {
    display: none;
  }
  #d-info:not(:checked) + h4 + table {
    display: none;
  }
  #d-info:not(:checked) + h4 {
    border-bottom: initial;
  }
</style>
