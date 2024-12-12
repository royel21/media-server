<script>
  export let items = [];
  export let current;
  export let title;
  export let setAsCurrent;

  let clazz = "";
  export { clazz as class };
</script>

<li id={items[0]?.Id} class="list-item s-list" class:selected={items[0]?.Id === current} on:mouseenter={setAsCurrent}>
  {title}
  {#if items.length > 1}
    <span>&#x25B8;</span>
    <ul class="sub-list">
      {#each items as { Id, Name }}
        <li class={`list-item ${clazz}`} id={Id} class:selected={Id === current} on:mouseenter={setAsCurrent}>
          <span>{Name}</span>
        </li>
      {/each}
    </ul>
  {/if}
</li>

<style>
  .list-item .sub-current {
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
    pointer-events: none;
  }
  li:not(:last-child) {
    border-bottom: 1px solid;
  }
  li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }

  li:first-child {
    border-radius: 0 0.25rem 0 0;
  }

  .sub-list {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    background-color: #343a40;
    border-radius: 0 0.25rem 0.25rem 0.25rem;
    z-index: 99;
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
