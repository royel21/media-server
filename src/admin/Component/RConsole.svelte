<script>
  import { getContext, afterUpdate, onMount } from "svelte";
  import { ConsoleStore, setConsoleData, updateConsole, showConsoleStore } from "../Store/ConsoleStore";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";

  let ref;
  let items = [];
  let toggle = true;
  let update = false;
  let dragger;
  let rconsole;
  let expanded = false;
  const state = { height: 180 };
  const tabRex = /configs|downloads|content-manager/;
  let canShow = tabRex.test(location.pathname);

  const socket = getContext("socket");

  const onClear = () => {
    apiUtils.get(["admin", "downloader", "clear-events"]);
    ConsoleStore.set([]);
  };
  ConsoleStore.subscribe((value) => (items = value));

  const onData = (data) => {
    if (data.text) {
      updateConsole(data);
    }

    if (data.error) {
      console.log(data.error);
    }
  };

  const toggleConsole = () => {};

  const onNavigate = ({ currentTarget: { currentEntry } }) => {
    update = currentEntry.url;
  };

  const onExpand = () => {
    rconsole.style.height = expanded ? "120px" : "calc(100% - 205px)";
    expanded = !expanded;
    state.height = rconsole.offsetHeight;
  };

  const loadEvents = async (pg = 1) => {
    const result = await apiUtils.get(["admin", "downloader", "events", pg]);
    if (!result.error) {
      setConsoleData(result);
    }
  };

  const onMouseDown = (e) => {
    state.dragge = true;
    state.y = e.clientY;
    state.height = rconsole.offsetHeight;
  };

  onMount(() => {
    socket.on("info", onData);
    loadEvents();
    const onMouseMove = (e) => {
      if (state.dragge) {
        rconsole.style.height = state.height + state.y - e.clientY + "px";
      }
    };

    const resetState = (e) => (state.dragge = false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("mouseup", resetState);
    document.addEventListener("mouseleave", resetState);
    navigation.addEventListener("navigate", onNavigate);
    return () => {
      socket.off("info", onData);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", resetState);
      document.removeEventListener("mouseleave", resetState);
      navigation.removeEventListener("navigate", onNavigate);
    };
  }, []);

  afterUpdate(() => {
    ref?.querySelector("div:last-child")?.scrollIntoView();
    dragger?.removeEventListener("mousedown", onMouseDown);
    dragger?.addEventListener("mousedown", onMouseDown);
  });

  showConsoleStore.set(canShow && $ConsoleStore.length);
  $: if (update) {
    canShow = tabRex.test(update);
  }
  $: showConsoleStore.set(canShow && $ConsoleStore.length && toggle);
</script>

{#if canShow}
  <label on:keydown on:click={toggleConsole} class:toggle>
    <input type="checkbox" bind:checked={toggle} />
    <Icons name={toggle ? "eyeslash" : "eye"} box="0 0 564 512" width="30px" height="20px" />
  </label>
  <div class="cls-container" bind:this={rconsole} class:hide-dragg={items.length === 0 || !toggle}>
    <div class="dragger" bind:this={dragger} on:touchstart={onExpand} />
    {#if toggle && items.length}
      <div class="r-console" on:dblclick={onExpand}>
        <span class="clean" on:keydown on:click={onClear}><Icons name="trash" /></span>
        <div class="text-list" bind:this={ref}>
          {#each items as item}
            <div style={`color: ${item.color || "red"}`} class:important={item.important}>
              {#if item.url}
                <a href={item.url} style={`color: ${item.color || "black"}`} target="_blank">{item.text}</a>
              {:else}
                <span>{item.text}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cls-container {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 9px;
    height: 120px;
    min-height: 120px;
    max-height: calc(100% - 205px);
    background-color: transparent;
    z-index: 301;
  }
  .hide-dragg {
    display: none;
  }
  .r-console {
    height: 100%;
    padding: 2px;
    background-color: white;
    border-radius: 0.25rem;
  }
  .r-console::after {
    content: " ";
    display: inline-block;
    position: absolute;
    top: -5px;
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
    z-index: 99;
    right: 20px;
    top: 54px;
    padding: 0 5px;
    border-radius: 50%;
  }
  input {
    display: none;
  }
  .r-console .clean {
    position: absolute;
    right: 0;
    z-index: 1000;
  }
  .r-console .clean :global(svg) {
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
    text-align: left;
  }
  .text-list .important {
    position: sticky;
    top: -5px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    pointer-events: none;
  }
  .important span {
    background-color: white;
  }

  @media screen and (max-width: 620px) {
    .cls-container {
      max-height: calc(100% - 230px);
    }

    .text-list .important {
      font-size: 1.1rem;
    }
    .text-list {
      font-size: 0.8rem;
    }
  }
</style>
