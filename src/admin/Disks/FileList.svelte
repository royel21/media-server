<script>
  import apiUtils from "src/apiUtils";
  import Menu from "./Menu.svelte";
  import MoveFileDialog from "./MoveFileDialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  import CCheckbox from "../Component/CCheckbox.svelte";
  import { validateCheck } from "../Utils";
  import { onDestroy } from "svelte";
  import Confirm from "../Component/Confirm.svelte";
  import { setMessage } from "../Store/MessageStore";

  export let files = [];
  export let socket;

  let showConfirm = false;
  let showMoveDialog;
  let removeList = [];
  let isChecked = false;

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
    if (validateCheck(removeList, files)) {
      removeList = removeList.filter((item) => !files.find((i) => i.Id === item));
    } else {
      removeList = [...removeList, ...files.filter((item) => !removeList.includes(item.Id)).map((item) => item.Id)];
    }
  };

  const removeFiles = () => {
    const items = files.filter((f) => removeList.includes(f.Id));
    socket.emit("file-work", { action: "removeFiles", data: { files: items } });
    console.log("confirm");
  };

  const onTransfer = () => {
    const items = files.filter((f) => removeList.includes(f.Id));
    showMoveDialog = { files: items };
  };

  const acept = (data) => {
    showMoveDialog = false;
    socket.emit("file-work", { action: "moveFiles", data });
  };

  const onFileInfo = ({ msg, items, error }) => {
    console.log(error, msg);
    setMessage({ msg: error || msg, error });
    if (items) {
      files = files.filter((f) => !items.includes(f.Id));
      removeList = [];
    }
  };
  socket.on("files-info", onFileInfo);
  onDestroy(() => {
    socket.off("files-info", onFileInfo);
  });

  $: isChecked = removeList.length === files.length;
</script>

{#if showMoveDialog}
  <MoveFileDialog files={showMoveDialog.files} hide={() => (showMoveDialog = false)} {acept} />
{/if}

{#if showConfirm}
  <Confirm text="those Files" acept={removeFiles} cancel={() => (showConfirm = false)} data={showConfirm} />
{/if}

<div class="col">
  <div class="tree-files">
    <h4>
      <span id="f-controls">
        <CCheckbox id="check-all" on:change={onCheckAll} {isChecked} title="Select All Files" />
        {#if removeList.length}
          <span on:click={onTransfer}><Icons name="right-left" /></span>
        {/if}
      </span>
      <span>Files - {files.length}</span>

      {#if removeList.length}
        <span class="rm-all" on:click={() => (showConfirm = true)}><Icons name="trash" /></span>
      {/if}
    </h4>
    <ul>
      {#each files as file}
        <li id={file.Id} title={file.Name}>
          <CCheckbox on:change={onCheck} isChecked={removeList.includes(file.Id)} />
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
  h4 {
    position: sticky;
    top: 0;
    text-align: center;
    border-bottom: 1px solid;
    background-color: #535353;
    z-index: 9;
  }
  h4 span {
    display: inline-block;
  }
  #f-controls {
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    top: -2px;
    width: 63px;
  }
  .tree-files :global(#check-all) {
    top: 4px;
    left: -4px;
  }
  .rm-all {
    position: absolute;
    right: 0;
  }
  li:hover span:last-child {
    cursor: pointer;
    text-decoration: underline;
  }
</style>
