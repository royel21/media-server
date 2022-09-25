<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "../../api-utils";
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
    <span class="dir" on:click={scanDirectory}>
      <i class={`fa fa-${type} mr-1`} />
      {Name}
    </span>
    <span class="caret" on:click={expandFolder}>▶</span>
    {#if Content.length > 0}
      <ul class="tree-node">
        <svelte:self type="folder" items={Content} on:scanDir />
      </ul>
    {/if}
  </li>
{/each}

<style>
  .tree-item {
    position: relative;
  }
  ul {
    margin-left: 29px;
    user-select: none;
  }
  li {
    min-height: 30px;
  }
  li:hover > span:first-child {
    text-decoration: underline;
  }
  .caret {
    position: absolute;
    left: -25px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    cursor: pointer;
    font-size: 1.1rem;
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
</style>
