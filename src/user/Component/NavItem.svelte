<script>
  import Link from "svelte-routing/src/Link.svelte";
  import { getProps } from "../../ShareComponent/DataUtils";
  import Icons from "../../icons/Icons.svelte";
  export let dirs;
  export let item;

  let data = { items: [], current: "" };

  const select = ({ target: { id } }) => {
    data.current = id;
  };

  $: if (dirs.Mangas.length) {
    let current = dirs[item.title][0]?.Id || "";

    data = {
      items: dirs[item.title],
      current,
    };
  }
</script>

<li class="nav-item">
  <Link to={`${item.path}/${data.current}`} {getProps}>
    <Icons name={item.class} height="22px" color={item.color} />
    <span class="nav-title">{item.title}</span>
    {#if data.items}
      <ul class="down-list">
        {#each data.items as { Id, Name, IsAdult }}
          <li
            class="list-item"
            id={Id}
            class:selected={Id === data.current}
            on:click={select}
            on:keydown
            class:adult={IsAdult}
          >
            <span>{Name}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </Link>
</li>

<style>
  .nav-item:hover ul {
    display: initial;
  }
  .nav-item ul .list-item:hover {
    background-color: #8e5e00;
  }
  .list-item span {
    pointer-events: none;
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
    padding: 5px;
    font-weight: bold;
    font-size: 12px;
    max-width: 210px;
    overflow: hidden;
    white-space: nowrap;
  }
  .down-list li span {
    max-width: 100%;
    overflow: hidden;
    display: inline-block;
  }
  .down-list li:not(:last-child) {
    border-bottom: 1px solid;
  }
  .adult {
    background-color: firebrick;
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
