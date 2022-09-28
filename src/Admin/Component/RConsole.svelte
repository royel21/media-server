<script>
  import { getContext, onDestroy, afterUpdate } from "svelte";
  import { ConsoleStore, updateConsole } from "../Store/ConsoleStore";

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
  <span class="fa-icon fas fa-trash-alt" on:click={onClear} />

  {#if items.length}
    <div class="text-list" bind:this={ref}>
      {#each items as item}<div>{item}</div>{/each}
    </div>
  {/if}
</div>

<style>
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
  .fa-icon {
    position: absolute;
    right: 14px;
    bottom: 5px;
    font-size: 24px;
  }
</style>
