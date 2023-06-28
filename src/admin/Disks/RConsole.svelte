<script>
  import { getContext, onDestroy, afterUpdate } from "svelte";
  import { ConsoleStore, updateConsole } from "../Store/ConsoleStore";
  import Icons from "../..//icons/Icons.svelte";

  let ref;
  let items = [];

  const socket = getContext("socket");

  const onClear = () => ConsoleStore.set([]);

  const onInfo = (data) => {
    updateConsole(data.text);
  };

  ConsoleStore.subscribe((value) => (items = value));

  socket.on("info", onInfo);

  onDestroy(() => {
    socket.off("info", onInfo);
  });

  afterUpdate(() => {
    ref?.querySelector("div:last-child")?.scrollIntoView();
  });
</script>

<div class="r-console">
  {#if items.length}
    <span on:click={onClear}><Icons name="trash" /></span>
    <div class="text-list" bind:this={ref}>
      {#each items as item}<div>{item}</div>{/each}
    </div>
  {/if}
</div>

<style>
  .r-console span {
    position: absolute;
    right: 0;
    z-index: 99999;
  }
  .r-console span :global(svg) {
    height: 30px;
    width: 35px;
  }
  .r-console {
    position: relative;
    height: 180px;
  }
  .text-list {
    height: 100%;
    background-color: white;
    border-radius: 0.25rem;
    color: black;
    font-size: 16px;
    font-weight: 600;
    padding: 5px;
    overflow-x: auto;
  }
  .text-list > div {
    white-space: nowrap;
  }
</style>
