<script>
  import MoveFileDialog from "./MoveFileDialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";
  import { validateCheck } from "../Utils";
  import { onDestroy } from "svelte";
  import Confirm from "../Component/Confirm.svelte";
  import { setMessage } from "../Store/MessageStore";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Loading from "src/ShareComponent/Loading.svelte";
  import RenameModal from "./RenameModal.svelte";
  import { sortByName } from "src/ShareComponent/utils";

  export let files = [];
  export let socket;
  export let Name = "";
  let filtered = files;

  let removeList = [];
  let isChecked = false;
  let transfer = false;
  let filter = "";

  let showMoveDialog;
  let showConfirm = false;
  let showRename = false;

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
    transfer = true;
  };

  const onFileInfo = ({ msg, items, error, ren, file }) => {
    setMessage({ error, msg });
    if (items || error) {
      transfer = false;
    }
    if (ren) {
      const index = files.findIndex((f) => f.Id === file.Id);
      if (index > -1) {
        files[index] = file;
        files = files.sort(sortByName);
      }
    } else if (items) {
      files = files.filter((f) => !items.includes(f.Id));
      removeList = [];
    }
  };

  const renameFile = (data) => {
    socket.emit("file-work", { action: "renFile", data: { file: data.folder, Name: data.Name } });
  };

  socket.on("files-info", onFileInfo);
  onDestroy(() => {
    socket.off("files-info", onFileInfo);
  });

  $: isChecked = filtered.length && removeList.length === filtered.length;
  $: {
    filtered = files.filter((f) => f.Name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  }
</script>

{#if showMoveDialog}
  <MoveFileDialog files={showMoveDialog.files} hide={() => (showMoveDialog = false)} {acept} />
{/if}

{#if showConfirm}
  <Confirm
    text={`${removeList.length} Files`}
    acept={removeFiles}
    cancel={() => (showConfirm = false)}
    data={showConfirm}
  />
{/if}

{#if showRename}
  <RenameModal data={showRename} acept={renameFile} hide={() => (showRename = false)} />
{/if}

<div class="col">
  <div class="tree-files">
    {#if transfer}
      <Loading text="Transfer In Process - Please Wait" />
    {/if}
    <div class="ftree-control">
      <h4>{files.length} - {Name}</h4>
      <div class="filter">
        <span>
          <CCheckbox id="check-all" on:change={onCheckAll} {isChecked} title="Select All Files" />
          {#if removeList.length}
            <span on:click={onTransfer}><Icons name="right-left" /></span>
            <span class="rm-all" on:click={() => (showConfirm = true)}><Icons name="trash" /></span>
          {/if}
        </span>
        <Filter id="file-filter" bind:filter />
      </div>
    </div>
    <ul>
      {#each filtered as file}
        <li id={file.Id} title={file.Name}>
          <CCheckbox on:change={onCheck} isChecked={removeList.includes(file.Id)} />
          <span on:click={() => (showRename = file)}><Icons name="edit" /></span>
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
    z-index: 999;
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
    overflow-y: auto;
    padding: 0 5px;
  }
  .tree-files ul {
    margin: 0;
  }
  .tree-files li {
    padding: 3px 8px;
  }
  .tree-files li {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    cursor: pointer;
    display: inline-block;
    width: calc(100% - 50px);
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: text;
    border-bottom: 1px solid;
    overflow-x: hidden;
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
    flex-direction: raw;
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
</style>
