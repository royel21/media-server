<script>
  import { onMount } from "svelte";
  import Axios from "Axios";
  export let items = [];
  export let type;
  //   export let socket;
  const scanDir = () => {};
  const expandFolder = event => {
    let li = event.target.closest("li");
    let tempData = [...items];
    let item = tempData.find(d => d.Id.toString() === li.id);
    if (item.Content.length === 0) {
      Axios.post("/api/admin/directories/Content", { Path: item.Path }).then(
        ({ data }) => {
          item.Content = data.data;
          items = tempData;
        }
      );
    } else {
      item.Content = [];
      items = tempData;
    }
  };
</script>

<style>
  .tree-item {
    position: relative;
  }
  ul {
    margin-left: 29px;
    user-select: none;
  }
  .caret {
    position: absolute;
    left: -20px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    margin-right: 5px;
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
  .fa {
    position: relative;
  }
  .fa:hover:after {
    content: "Click To Add";
    position: absolute;
    top: -28px;
    width: max-content;
    padding: 5px;
    border-radius: 0.25rem;
    background-color: #007bff;
  }
</style>

{#each items as { Content, Id, Name }}
  <li id={Id} class="tree-item">
    <i class={`fa fa-${type} mr-1`} />
    <span class="dir" on:click={scanDir}>{Name}</span>
    <span class="caret" on:click={expandFolder}>▶</span>
    {#if Content.length > 0}
      <ul class="tree-node">
        <svelte:self type="folder" items={Content} />
      </ul>
    {/if}
  </li>
{/each}
