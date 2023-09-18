<script>
  import { getContext, onDestroy, afterUpdate, onMount } from "svelte";
  import { ConsoleStore, updateConsole } from "../Store/ConsoleStore";
  import Icons from "../../icons/Icons.svelte";

  let ref;
  let items = [];
  let toggle = true;
  let canShow = /content-manager|tools/.test(location.pathname);
  let update = false;
  let dragger;
  let rconsole;
  let expanded = false;

  const socket = getContext("socket");

  const onClear = () => ConsoleStore.set([]);
  ConsoleStore.subscribe((value) => (items = value));

  socket.on("info", (data) => {
    if (data.text) {
      updateConsole(data);
    }
  });

  const toggleConsole = () => {};

  onDestroy(() => {
    socket.off("info", updateConsole);
  });

  afterUpdate(() => {
    ref?.querySelector("div:last-child")?.scrollIntoView();
  });

  const onNavigate = ({ navigationType, currentTarget: { currentEntry } }) => {
    if (navigationType === "push") {
      update = currentEntry.url;
    }
  };

  const onExpand = () => {
    rconsole.style.height = expanded ? "120px" : "calc(100% - 205px)";
    expanded = !expanded;
  };

  onMount(() => {
    const state = { height: 180 };
    if (dragger) {
      dragger.addEventListener("mousedown", (e) => {
        state.dragge = true;
        state.y = e.clientY;
      });
    }

    const onMouseMove = (e) => {
      if (state.dragge) {
        e.preventDefault();
        state.lastHeight = state.height + state.y - e.clientY;
        rconsole.style.height = state.lastHeight + "px";
      }
    };

    const resetState = (e) => {
      state.dragge = false;
      if (state.lastHeight) {
        e.preventDefault();
        state.height = state.lastHeight;
        state.lastHeight = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", resetState);
    document.addEventListener("mouseleave", resetState);
    navigation.addEventListener("navigate", onNavigate);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", resetState);
      document.removeEventListener("mouseleave", resetState);
      navigation.removeEventListener("navigate", onNavigate);
    };
  }, []);

  $: if (update) {
    canShow = /content-manager|tools/.test(location.pathname);
  }
</script>

{#if canShow}
  <label on:keydown on:click={toggleConsole} class:toggle>
    <input type="checkbox" bind:checked={toggle} /><Icons name={toggle ? "eyeslash" : "eye"} box="0 0 564 512" />
  </label>
  {#if toggle && items.length}
    <div class="r-console" bind:this={rconsole} on:dblclick={onExpand}>
      <div class="dragger" bind:this={dragger} />
      <span on:keydown on:click={onClear}><Icons name="trash" /></span>
      <div class="text-list" bind:this={ref}>
        {#each items as item}
          <div style={`color: ${item.color || "black"}`}>
            {#if item.url}
              <a href={item.url} style={`color: ${item.color || "black"}`} target="_blank">{item.text}</a>
            {:else}
              {item.text}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/if}

<style>
  .r-console {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 9px;
    height: 180px;
    min-height: 120px;
    max-height: calc(100% - 205px);
    padding: 2px;
    background-color: white;
    border-radius: 0.25rem;
  }
  .r-console::after {
    content: " ";
    display: inline-block;
    position: absolute;
    top: -3px;
    left: calc(50% - 5px);
    height: 10px;
    width: 10px;
    transform: rotate(45deg);
    background-color: white;
    z-index: -1;
  }
  .dragger {
    position: absolute;
    top: -2px;
    left: 0;
    height: 10px;
    width: 100%;
    background-color: transparent;
    cursor: ns-resize;
  }
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
  .text-list {
    height: 100%;
    background-color: white;
    color: black;
    font-size: 16px;
    font-weight: 600;
    padding: 3px;
    overflow-x: auto;
  }
  .text-list > div {
    white-space: nowrap;
  }

  @media screen and (max-width: 600px) {
    .r-console {
      max-height: calc(100% - 230px);
    }
    label {
      top: 85px;
      right: 16px;
    }
  }
</style>
