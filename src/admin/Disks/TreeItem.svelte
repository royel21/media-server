<script>
  import { createEventDispatcher } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import Content from "src/user/Pages/FileBrowser/Content.svelte";
  export let items = [];
  export let type;
  let item = {};

  const dispatch = createEventDispatcher();

  const expandFolder = async (event) => {
    let li = event.target.closest("li");
    let item = items.find((d) => d.Id.toString() === li.id);
    if (item.Content.length === 0) {
      const data = await apiUtils.post("admin/directories/Content", { Path: item.Path });
      item.Content = data.data;
      items = items;
    } else {
      item.Content = [];
      items = items;
    }
  };
  const scanDirectory = (event) => {
    let li = event.target.closest("li");
    item = items.find((d) => d.Id.toString() === li.id);
    dispatch("scanDir", item);
  };
</script>

{#each items as { Content, Id, Name }}
  <li id={Id} class="tree-item">
    <span class="caret" class:content={Content.length} class:atop={type === "hdd"} on:click={expandFolder}>▶</span>
    <span class="dir" class:atop={type === "hdd"} on:click={scanDirectory}>
      <Icons name={type} />
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
  ul {
    margin-left: 29px;
  }
  .dir:hover {
    text-decoration: underline;
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
    display: inline-block;
    width: 91%;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dir {
    position: relative;
    cursor: pointer;
  }
  .dir:hover:after {
    content: "Click To Add";
    position: absolute;
    top: -40px;
    left: 25px;
    width: max-content;
    padding: 5px;
    border-radius: 0.25rem;
    background-color: #007bff;
  }
  .dir:hover:before {
    display: inline-block;
    content: " ";
    position: absolute;
    top: -11px;
    left: 66px;
    width: 10px;
    height: 10px;
    background-color: #007bff;
    transform: rotate(45deg);
  }
  .atop {
    position: sticky;
    top: 0;
    background-color: #343a40;
  }
</style>
