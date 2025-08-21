<script>
  import Icons from "src/icons/Icons.svelte";
  import { getContext, onDestroy } from "svelte";

  const socket = getContext("socket");

  let diskData = [];

  let ref;
  let totalFree;
  let totalUsed;

  const onDiskdata = (data) => {
    diskData = data;
  };

  const getPercent = (total, val) => {
    if (val === "N/A") return "";

    const tval = total.replace("GB", "");
    const vval = val.replace("GB", "");
    return `(${parseFloat((vval / tval) * 100).toFixed(1)}%)`;
  };

  const reload = () => {
    socket.emit("load-disks");
  };

  socket.on("disk-loaded", onDiskdata);
  socket.emit("load-disks");

  onDestroy(() => {
    socket.off("disk-loaded", onDiskdata);
  });

  const reducer = (att) => (accumulator, d) => accumulator + (+d[att].replace("GB", "") || 0);

  $: totalFree = (diskData.reduce(reducer("Used"), 0) / 1024).toFixed(2);
  $: totalUsed = (diskData.reduce(reducer("Size"), 0) / 1024).toFixed(2);
</script>

<div class="d-info" bind:this={ref}>
  <h4><span on:click={reload}><Icons name="sync" /></span><span>Disk Info {totalFree}TB/{totalUsed}TB</span></h4>
  <div class="disk-content">
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
            <td>{Free}{getPercent(Size, Free)}</td>
            <td>{Used}{getPercent(Size, Used)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .d-info {
    height: 100%;
  }
  .disk-content {
    height: calc(100% - 34px);
    overflow-x: auto;
  }
  table {
    width: 100%;
    margin: 0 auto;
    max-width: 600px;
  }
  .skip {
    text-align: left;
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
  th,
  td {
    padding: 0 5px;
  }
</style>
