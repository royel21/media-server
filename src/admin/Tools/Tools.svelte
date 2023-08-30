<script>
  import Icons from "../../icons/Icons.svelte";
  import apiUtils from "../../apiUtils";
  import { onMount, getContext } from "svelte";
  const socket = getContext("socket");
  //clean-images
  let backups = [];

  const onBackup = () => {
    socket.emit("backup-db", { event: "backup" });
  };

  const onCleanImages = () => {
    socket.emit("clean-images");
  };

  const restoreBackup = ({ target }) => {
    const bckp = target.closest("tr").id;
  };
  const removeBackup = async ({ target }) => {
    const backup = target.closest("tr").id;
    const result = await apiUtils.post("admin/directories/rm-backup", { backup });
    if (result.success) {
      backups = backups.filter((bk) => bk !== backup);
    }
  };

  const reload = async () => {
    const result = await apiUtils.get(["admin", "directories", "backups"]);
    backups = result.sort().reverse();
  };

  onMount(async () => {
    reload();
    socket.on("reload-backups", reload);
    return () => {
      socket.off("reload-backups", reload);
    };
  });
</script>

<div>
  <h2>Tools</h2>
  <div>
    <button class="btn" on:click={onBackup}>Create Backup</button>
    <button class="btn" on:click={onCleanImages}>Clean Orfan Images</button>
  </div>
  <div class="data-table">
    <table class="table table-dark table-hover table-bordered">
      <thead>
        <tr>
          <th>No.</th>
          <th>Bakups</th>
          <th class="action">Action</th>
        </tr>
      </thead>
      <tbody>
        {#each backups as backup, i}
          <tr id={backup}>
            <td>{i + 1}</td>
            <td>{backup}</td>
            <td>
              <span on:click={restoreBackup} on:keydown={() => {}}><Icons name="sync" /></span>
              <span on:click={removeBackup} on:keydown={() => {}}><Icons name="trash" /></span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  h2 {
    text-align: center;
    border-bottom: 2px solid;
    margin-bottom: 5px;
    padding-bottom: 10px;
  }
  .data-table {
    margin-top: 10px;
    padding: 10px;
  }
  td:last-child,
  .action {
    width: 90px;
    max-width: 90px;
    text-align: center;
  }
</style>
