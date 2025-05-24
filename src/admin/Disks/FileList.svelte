<script>
  import { onDestroy } from "svelte";
  import { validateCheck } from "../Utils";
  import Icons from "src/icons/Icons.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";
  import Confirm from "../Component/Confirm.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import MoveFileDialog from "./MoveFileDialog.svelte";
  import RenameModal from "./RenameModal.svelte";

  import { setMessage } from "../Store/MessageStore";
  import { sortByName } from "src/ShareComponent/utils";
  import { formatDate } from "../Downloader/utils";
  import apiUtils from "src/apiUtils";
  import BulkEdit from "./BulkEdit.svelte";

  export let files = [];
  export let socket;
  export let content = [];
  export let Name = "";
  export let current;

  let filtered = files;
  let TotalSize = 0;
  let sortBy = "name";

  let removeList = [];
  let isChecked = false;
  let filter = "";

  let showMoveDialog;
  let showConfirm = false;
  let showRename = false;
  let showBulkRename = false;

  const onCheck = ({ target }) => {
    const id = target.closest("li").id;
    if (id) {
      if (!removeList.includes(id)) {
        removeList = [...removeList, id];
      } else {
        removeList = removeList.filter((item) => item !== id);
      }
    }
  };

  const onCheckAll = () => {
    if (validateCheck(removeList, filtered)) {
      removeList = removeList.filter((item) => !filtered.find((i) => i.Id === item));
    } else {
      removeList = [...removeList, ...filtered.filter((item) => !removeList.includes(item.Id)).map((item) => item.Id)];
    }
  };

  const hideRename = () => (showRename = false);

  const hideBulkRename = () => (showBulkRename = false);

  const onBulkRename = (item) => {
    const items = files.filter((f) => removeList.includes(f.Id));
    socket.emit("file-work", { action: "bulkRename", data: { ...item, files: items } });
    hideBulkRename();
  };

  const removeFiles = () => {
    const items = files.filter((f) => removeList.includes(f.Id));
    socket.emit("file-work", { action: "removeFiles", data: { files: items } });
  };

  const onTransfer = () => {
    const items = filtered.filter((f) => removeList.includes(f.Id));
    showMoveDialog = { files: items };
  };

  const acept = (data) => {
    showMoveDialog = false;
    socket.emit("file-work", { action: "moveFiles", data });
  };

  const onFileInfo = ({ msg, items, bulk, error, ren, file }) => {
    if (msg || error) {
      setMessage({ error, msg });
    }

    if (bulk) {
      for (let item of items) {
        const index = files.findIndex((f) => f.Id === item.Id);
        if (files[index]) {
          files[index] = item;
        }
      }
      files = files.sort(sortByName);
    }

    if (ren) {
      const index = files.findIndex((f) => f.Id === file.Id);
      if (index > -1) {
        files[index] = file;
        files = files.sort(sortByName);
      }
    }
  };

  const fileUpdate = ({ move }) => {
    if (move) {
      removeList = removeList.filter((f) => f.Id !== move.Id);
      files = files.filter((f) => f.Id !== move.Id);
    }
  };

  const renameFile = (data) => {
    socket.emit("file-work", { action: "renFile", data: { file: data.folder, Name: data.Name } });
    hideRename();
  };

  const reload = async () => {
    if (current) {
      const data = await apiUtils.post("admin/directories/Content", { Path: current.Path });
      if (data.data) {
        files = data.data.filter((it) => it.Type === "file");
      }
    }
  };

  socket.on("files-info", onFileInfo);
  socket.on("info", fileUpdate);
  onDestroy(() => {
    socket.off("info", fileUpdate);
    socket.off("files-info", onFileInfo);
  });

  const getSize = () => {
    let sum = 0;
    filtered.forEach((f) => (sum += f.Size));
    return (sum / 1024 / 1024 / 1024).toFixed(2) + "GB";
  };

  const sorter = {
    name: sortByName,
    date: (a, b) => b.LastModified - a.LastModified,
    size: (a, b) => b.Size - a.Size,
  };

  $: isChecked = filtered.length && removeList.length === filtered.length;

  $: {
    filtered = files
      .filter((f) => f.Name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
      .map((d) => ({ ...d, LastModified: new Date(d.LastModified) }))
      .sort(sorter[sortBy]);
    TotalSize = getSize();
  }

  $: if (files.length) {
    removeList = [];
  }
</script>

{#if showMoveDialog}
  <MoveFileDialog files={showMoveDialog.files} hide={() => (showMoveDialog = false)} {acept} {content} />
{/if}

{#if showConfirm}
  <Confirm
    text={`${removeList.length} Files`}
    acept={removeFiles}
    cancel={() => (showConfirm = false)}
    data={showConfirm}
  />
{/if}

{#if showBulkRename}
  <BulkEdit files={removeList} hide={hideBulkRename} acept={onBulkRename} />
{/if}

{#if showRename}
  <RenameModal data={showRename} acept={renameFile} hide={hideRename} />
{/if}

<div class="col">
  <div class="tree-files">
    <div class="ftree-control">
      <h4>{filtered.length}/{TotalSize} - {Name}</h4>
      <div class="filter">
        <span>
          <CCheckbox id="check-all" on:change={onCheckAll} {isChecked} title="Select All Files" />
          {#if removeList.length}
            <span on:click={() => (showBulkRename = true)}><Icons name="edit" /></span>
            <span on:click={onTransfer}><Icons name="right-left" /></span>
            <span class="rm-all" on:click={() => (showConfirm = true)}><Icons name="trash" /></span>
          {:else}
            <span class="btn-sync" on:click={reload}><Icons name="sync" /></span>
          {/if}
        </span>
        <Filter id="file-filter" bind:filter />
        <span class="input-group">
          <span class="input-group-text"><Icons name="list" color="black" box="0 0 512 512" /></span>
          <select bind:value={sortBy} class="form-control">
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </span>
      </div>
    </div>
    <ul>
      {#each filtered as file}
        <li id={file.Id} title={formatDate(file.LastModified)}>
          <CCheckbox on:change={onCheck} isChecked={removeList.includes(file.Id)} />
          <span on:click={() => (showRename = file)}><Icons name="edit" /></span>
          {(file.Size / 1024 / 1024 / 1024).toFixed(3)}GB -
          <span on:click={onCheck}>{file.Name}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .col {
    position: relative;
  }
  .col :global(.loading) {
    position: absolute;
    width: 100%;
    z-index: 402;
    background-color: rgb(221 170 94 / 13%);
  }
  .col :global(.loading .spin::before) {
    height: 350px;
    width: 350px;
  }
  .col :global(.loading h4) {
    font-size: 1.2rem;
  }

  .tree-files {
    height: 100%;
    padding: 0 5px;
  }
  .tree-files ul {
    height: calc(100% - 81px);
    width: 100%;
    overflow: auto;
    margin: 0;
    padding-bottom: 5px;
  }
  .tree-files li {
    font-size: 0.9rem;
    padding: 3px 8px;
    white-space: nowrap;
  }
  .ftree-control {
    position: sticky;
    top: 0;
    text-align: center;
    background-color: #535353;
    z-index: 9;
  }
  h4 {
    position: relative;
    display: inline-block;
    width: calc(100% - 25px);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    user-select: text;
    border-bottom: 1px solid;
    font-size: 1.12rem;
  }
  .tree-files :global(#check-all) {
    top: 2px;
    left: -15px;
    width: 30px;
    margin-left: 3px;
  }
  li:hover span:last-child {
    cursor: pointer;
    text-decoration: underline;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .filter {
    position: relative;
    display: flex;
    flex-direction: row;
    padding: 5px;
    border-bottom: 1px solid white;
  }
  .filter :global(#filter-control) {
    margin: 0 5px;
  }
  .filter span {
    display: flex;
    flex-direction: row;
  }
  .filter span > span {
    position: relative;
    display: inline-block;
    width: 30px;
    padding: 0 5px;
    text-align: center;
  }

  .filter > span :global(.icon-trash) {
    left: 3px;
  }
  .filter :global(.c-filter) {
    max-width: initial;
    padding-right: 5px;
  }
  .form-control {
    width: 70px;
    padding: 0.1rem 0rem;
  }
  .input-group :global(.icon-list) {
    left: -3px;
  }
  .input-group {
    min-width: 100px;
  }
  .rm-all {
    margin-right: 5px;
  }
  .tree-files .btn-sync {
    display: inline-block;
    width: 35px;
  }
</style>
