<script>
  import { afterUpdate } from "svelte";

  export let event;
  export let onMenuClick;
  export let menuItems;
  let ref;

  let left = event?.pageX;
  let top = event?.pageY;

  afterUpdate(() => {
    const h = document.body.offsetHeight;
    const w = document.body.offsetWidth;

    if (top + ref.offsetHeight > h) {
      top = top - ref.offsetHeight;
    }

    if (left + ref.offsetWidth > w) {
      top = top - ref.offsetWidth;
    }
  });

  $: if (event) {
    left = event?.pageX;
    top = event?.pageY;
  }
</script>

<div bind:this={ref} id="c-menu" style={`left: ${left}px; top:${top}px`} on:click={onMenuClick}>
  {#each menuItems as mItem}
    <div id={mItem.Id}>{mItem.Name}</div>
  {/each}
</div>

<style>
  #c-menu {
    z-index: 300;
    position: fixed;
    width: max-content;
    background-color: rgb(95, 91, 91);
    cursor: pointer;
    border-radius: 0.25rem;
  }
  #c-menu div {
    padding: 2px 5px;
  }
  #c-menu div:not(:last-child) {
    border-bottom: 1px solid;
  }
  #c-menu div:hover {
    background-color: #add8e647;
  }
</style>
