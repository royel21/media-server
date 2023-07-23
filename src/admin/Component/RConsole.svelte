<script>
  import { getContext, onDestroy, afterUpdate } from "svelte";
  import { ConsoleStore, updateConsole } from "../Store/ConsoleStore";
  import Icons from "../../icons/Icons.svelte";

  let ref;
  let items = [];
  let toggle = false;
  const socket = getContext("socket");

  const onClear = () => ConsoleStore.set([]);

  const onInfo = (data) => {
    updateConsole(data.text);
  };

  ConsoleStore.subscribe((value) => (items = value));

  socket.on("info", onInfo);

  const toggleConsole = () => {};

  onDestroy(() => {
    socket.off("info", onInfo);
  });

  afterUpdate(() => {
    ref?.querySelector("div:last-child")?.scrollIntoView();
  });
</script>

{#if items.length || /manager|tools/.test(location.pathname)}
  <label on:click={toggleConsole} class:toggle>
    <input type="checkbox" bind:checked={toggle} /><Icons name="eye" box="0 0 564 512" />
  </label>
  {#if toggle}
    <div class="r-console">
      <span on:click={onClear}><Icons name="trash" /></span>
      <div class="text-list" bind:this={ref}>
        {#each items as item}<div>{item}</div>{/each}
      </div>
    </div>
  {/if}
{/if}

<style>
  label {
    position: absolute;
    background: #0847ef;
    z-index: 99999999;
    right: 20px;
    top: 60px;
    padding: 0 5px;
    border-radius: 50%;
  }
  input {
    display: none;
  }
  .r-console span {
    position: absolute;
    right: 0;
    z-index: 99999;
  }
  .r-console span :global(svg) {
    height: 30px;
    width: 35px;
  }
  .r-console:empty {
    display: none;
  }
  .r-console {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 10px;
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
