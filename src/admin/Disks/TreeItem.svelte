<script>
  import { createEventDispatcher } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  export let items = [];
  export let type;
  let item = {};

  const dispatch = createEventDispatcher();

  const expandFolder = async (event) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);
    if (item.Content.length === 0) {
      const data = await apiUtils.post("admin/directories/Content", { Path: item.Path });
      item.Content = data.data;
      items = items;
    } else {
      item.Content = [];
      items = items;
    }
    items.forEach((it) => {
      if (it.Id !== item.Id) {
        it.Content = [];
      }
    });
  };
  const scanDirectory = (event) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);
    dispatch("scanDir", item);
  };

  const removeFile = async (file) => {
    const data = await apiUtils.post("admin/directories/remove-file", { Path: file.Path });
    if (data.success) {
      items = items.filter((it) => it.Path !== file.Path);
    }
  };
</script>

{#each items as { Content, Id, Name, Type, Path }}
  <li id={Id} class={`tree-item ${Type}`}>
    {#if Type === "folder" || type === "hdd"}
      <span class="caret" class:content={Content?.length} class:atop={type === "hdd"} on:click={expandFolder}>▶</span>
    {:else}
      <span on:click={() => removeFile({ Id, Path })}><Icons name="trash" /></span>
    {/if}
    <span class="dir" class:atop={type === "hdd"} on:click={scanDirectory}>
      <Icons name={Type || type} />
      {Name}
    </span>
    {#if Content.length > 0}
      <ul class="tree-node usn">
        <svelte:self type="folder" items={Content} on:scanDir />
      </ul>
    {/if}
  </li>
{/each}

<style>
  .tree-item {
    position: relative;
    min-height: 30px;
  }
  .tree-item :global(.icon-file),
  .tree-item :global(.icon-trash) {
    width: 20px;
  }
  ul {
    margin-left: 25px;
  }
  .dir:hover {
    text-decoration: underline;
    background-color: #add8e647;
  }
  .caret {
    display: inline-block;
    position: sticky;
    top: 0;
    left: -25px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    cursor: pointer;
    font-size: 1.1rem;
  }
  .caret.content {
    transform: rotate(90deg);
  }
  .caret:last-child {
    transform: rotate(0);
  }
  .caret:active {
    text-transform: scale(1.2);
  }
  .dir {
    position: relative;
    cursor: pointer;
    display: inline-block;
    width: calc(100% - 25px);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dir:hover:after {
    content: "Click To Add";
    top: -40px;
    left: 25px;
    width: max-content;
    padding: 5px;
    border-radius: 0.25rem;
  }
  .dir:hover:before {
    display: inline-block;
    content: " ";
    top: -11px;
    left: 66px;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
  }
  .dir:hover:after,
  .dir:hover:before {
    position: absolute;
    background-color: #007bff;
    pointer-events: none;
    z-index: 999;
  }
  .file .dir:hover:after,
  .file .dir:hover:before {
    display: none;
  }
  .file > .dir {
    pointer-events: none;
  }
  .atop {
    position: sticky;
    top: 0;
    background-color: #343a40;
    z-index: 99;
    pointer-events: none;
  }
  .caret {
    pointer-events: all;
  }

  .file {
    margin: 0;
  }
</style>
