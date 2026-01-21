<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import { onMount } from "svelte";
  import SelectDirectory from "./SelectDirectory.svelte";
  import Confirm from "../Component/Confirm.svelte";
  import { setMessage } from "../Store/MessageStore";

  let directories = [];

  let showSelectDir = false;
  let showEditPath = false;
  let showConfirmDelete = false;

  const addDir = (dirs) => {
    directories = [...dirs];
    showSelectDir = false;
  };

  const hideConfirm = () => (showConfirmDelete = false);
  const showConfirm = ({ target }) => {
    const Id = +target.closest("tr").id;
    showConfirmDelete = Id;
  };

  const loadDirectories = async () => {
    const data = await apiUtils.admin(["games", "directories"]);
    directories = data;
  };

  const removeDir = async (Id) => {
    await apiUtils.post("admin/games/remove-directory", { Id });
    loadDirectories();
  };

  const reloadGames = async ({ target }) => {
    const Id = +target.closest("tr").id;
    const result = await apiUtils.post("admin/games/reload", { Id }, "reload games");
    if (result.error) {
      return setMessage({ msg: result.error });
    }

    const index = directories.findIndex((d) => d.Id === Id);
    if (index !== -1) {
      directories[index].Count = result.count;
      directories = [...directories];
    }
  };
  const editDirPath = () => (showEditPath = true);

  onMount(loadDirectories);

  $: totalGames = directories.reduce((acc, dir) => acc + (dir.Count || 0), 0);
</script>

{#if showSelectDir}
  <SelectDirectory hide={() => (showSelectDir = false)} acept={addDir} />
{/if}

{#if showConfirmDelete}
  <Confirm data={showConfirmDelete} text="remove this directory?" cancel={hideConfirm} acept={removeDir} />
{/if}

<div class="game-directories">
  <h4>Directory List ~ Total {totalGames}</h4>
  <span class="add-dir" on:click={() => (showSelectDir = true)}><Icons name="squareplus" /></span>
  <div class="g-dirs">
    <table class="table table-dark table-hover table-bordered">
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Path</th>
          <th>Count</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each directories as dir, index}
          <tr id={dir.Id}>
            <td>{index + 1}</td>
            <td>{dir.Name}</td>
            <td>{dir.Path}</td>
            <td>{dir.Count}</td>
            <td>
              <span on:click={reloadGames}><Icons name="sync"></Icons></span>
              <span on:click={editDirPath}><Icons name="edit"></Icons></span>
              <span on:click={showConfirm}><Icons name="trash"></Icons></span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  h4 {
    text-align: center;
    border-bottom: 1px solid #ccc;
  }
  .game-directories {
    height: calc(100% - 40px);
  }
  .add-dir {
    position: absolute;
    top: -4px;
    left: 10px;
    cursor: pointer;
    padding: 2px;
    transform: scale(1.4);
  }
  .g-dirs {
    padding: 10px 0;
    height: 100%;
    overflow: auto;
  }
  td:first-child,
  th:first-child {
    width: 60px;
    min-width: 60px;
  }
  td:last-child,
  th:last-child {
    width: 140px;
    min-width: 140px;
    text-align: center;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 100px;
    min-width: 100px;
    text-align: center;
  }

  td span:nth-child(2) {
    margin: 0 8px;
  }
</style>
