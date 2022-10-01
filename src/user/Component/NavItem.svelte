<script>
  import Link from "svelte-routing/src/Link.svelte";
  import { getProps } from "../../ShareComponent/DataUtils";
  export let dirs;
  export let item;
  export let selected;
  export let selectDir;

  let items = [];
  let selectedId;

  $: if (dirs) {
    items = dirs[item.title];
    selectedId = selected[item.title];
  }
</script>

<li class="nav-item">
  <Link to={`${item.path}/${selectedId}`} {getProps}>
    <i class={"fas fa-" + item.class} />
    <span class="nav-title">{item.title}</span>
    <ul class="down-list">
      {#each items as { Id, Name }}
        <li class="list-item" id={Id} class:selected={Id === selectedId} on:click={selectDir} title={item.title}>
          {Name}
        </li>
      {/each}
    </ul>
  </Link>
</li>

<style>
  .nav-item:hover ul {
    display: initial;
  }
  .down-list {
    display: none;
    position: absolute;
    top: 100.5%;
    left: 0;
    min-width: 100%;
    text-align: left;
    background-color: #343a40;
    border-radius: 0 0 0.25rem 0.25rem;
  }
  .down-list:hover {
    display: initial;
  }
  .down-list li {
    padding: 8px;
    font-weight: bold;
    font-size: 12px;
  }

  .down-list li:not(:last-child) {
    border-bottom: 1px solid;
  }
  .nav-item:hover,
  .down-list li:hover {
    background-color: rgb(2 177 242);
  }

  .down-list li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }

  .selected {
    background-color: rgb(11 61 201 / 71%);
  }
</style>
