<script>
  export let items;
  export let current;
  export let title;
  let clazz = "";
  export { clazz as class };
</script>

<li class="list-item s-list" id={items[0]?.Id} class:selected={items[0]?.Id === current}>
  {title}
  {#if items.length > 1}
    <span>&gt;</span>
    <ul class="sub-list">
      {#each items as { Id, Name }}
        <li class={`list-item ${clazz}`} id={Id} class:selected={Id === current}>
          <span>{Name}</span>
        </li>
      {/each}
    </ul>
  {/if}
</li>

<style>
  .list-item:hover {
    background-color: #8e5e00;
  }
  .list-item span {
    pointer-events: none;
  }
  li {
    padding: 5px;
    font-weight: bold;
    font-size: 12px;
    min-width: 90px;
    max-width: 210px;
    overflow: hidden;
    white-space: nowrap;
    height: 33px;
  }
  li span {
    max-width: 100%;
    overflow: hidden;
    display: inline-block;
  }
  li:not(:last-child) {
    border-bottom: 1px solid;
  }
  li:hover {
    background-color: rgb(2 177 242);
  }
  li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }

  .sub-list {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    background-color: #343a40;
    border-radius: 0 0 0.25rem 0.25rem;
  }
  .s-list {
    position: relative;
    overflow: visible;
  }
  .s-list > span {
    position: absolute;
    top: -3px;
    right: 5px;
    font-size: 1.3rem;
  }
  .s-list:hover .sub-list {
    display: initial;
  }
  .selected {
    background-color: rgb(11 61 201 / 71%);
  }
</style>
