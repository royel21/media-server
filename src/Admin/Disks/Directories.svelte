<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import axios from "axios";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  onMount(async () => {
    let resp = await axios.get("/api/admin/directories");
    dirs = resp.data;
    socket.on("scan-finish", ({ id }) => {
      if (id) {
        let dir = dirs.find((d) => d.Id === id);
        dir.IsLoading = false;
        dirs = dirs;
      }
    });

    socket.on("scan-info", (info) => {
      console.log(info);
    });
  });
  onDestroy(() => {
    delete socket._callbacks["$scan-finish"];
    delete socket._callbacks["$scan-info"];
  });

  const removeDir = (e) => {
    let tr = e.target.closest("tr");
    if (tr) {
      axios
        .delete("/api/admin/directories/remove", {
          data: { Id: tr.id },
        })
        .then(({ data }) => {
          if (data.removed) {
            dirs = dirs.filter((d) => d.Id !== tr.id);
            dirs = dirs;
          } else {
            msg = data.msg;
          }
        });
    }
  };

  const rescan = (e) => {
    let tr = e.target.closest("tr");
    let dir = dirs.find((d) => d.Id === tr.id);
    socket.emit("scan-dir", { Id: dir.Id });
    dir.IsLoading = true;
    dirs = dirs;
  };
</script>

<style>
  .message {
    display: none;
  }
  .message:not(:empty) {
    display: block;
    color: red;
  }
</style>

<div class="message">{msg}</div>
<table id="dir-list" class="table table-dark table-hover table-bordered">
  <thead>
    <tr>
      <th>Actions</th>
      <th>Name</th>
      <th>Full Path</th>
    </tr>
  </thead>
  <tbody>
    {#if dirs.length < 0}
      <tr class="text-center">
        <td colSpan="3">Not Directory Added</td>
      </tr>
    {:else}
      {#each dirs as { Id, Name, IsLoading, FullPath }}
        <tr id={Id} key={Id}>
          <td>
            <span class="dir-sync" on:click={rescan}>
              <i class={'fas fa-sync' + (IsLoading ? ' fa-spin' : '')} />
            </span>
            <span class="dir-remove ml-2" on:click={removeDir}>
              <i class="fas fa-trash-alt" />
            </span>
          </td>
          <td>{Name}</td>
          <td>{FullPath}</td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
