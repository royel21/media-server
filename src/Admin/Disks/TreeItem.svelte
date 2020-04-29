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
      console.log(item.Path);
      Axios.post("/api/admin/directories/Content", { Path: item.Path }).then(
        ({ data }) => {
          item.Content = data.data;
          items = tempData;
          console.log(items);
        }
      );
    } else {
      item.Content = [];
      items = tempData;
    }
  };
  console.log("d:", items);
</script>

<style>
  ul {
    margin-left: 20px;
    user-select: none;
  }
  .caret {
    font-family: "Helvetica Neue", Arial, sans-serif;
    margin-right: 5px;
    cursor: pointer;
  }
  .caret:active {
    transform: scale(1.2);
  }
</style>

{#each items as { Content, Id, Name }}
  <li id={Id} class="tree-item">
    <span class="caret" on:click={expandFolder}>▶</span>
    <span class="dir" on:click={scanDir}>
      <i class={`fa fa-${type} mr-1`} />
      {Name}
    </span>
    {#if Content.length > 0}
      <ul class="tree-node">
        <svelte:self type="folder" items={Content} />
      </ul>
    {/if}
  </li>
{/each}
