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
      top = top - ref.offsetHeight - 10;
    }

    if (left + ref.offsetWidth > w) {
      left = left - ref.offsetWidth - 10;
    }
  });

  $: if (event) {
    left = event?.pageX + 10;
    top = event?.pageY + 10;
  }
</script>

<div bind:this={ref} id="c-menu" style={`left: ${left}px; top:${top}px`} on:click={onMenuClick}>
  {#each menuItems as mItem}
    <div id={mItem.Id} class:b-border={mItem.BBorder}>{mItem.Name}</div>
  {/each}
</div>

<style>
  #c-menu {
    z-index: 300;
    position: fixed;
    width: max-content;
    background-color: rgb(35 33 33);
    cursor: pointer;
    border-radius: 0.25rem;
  }
  #c-menu div {
    padding: 8px;
    user-select: none;
  }
  #c-menu .b-border {
    border-bottom: 1px solid;
  }
  #c-menu div:hover {
    background-color: #add8e647;
  }
</style>
