<script>
  import { getContext, afterUpdate, onMount } from "svelte";
  import { ConsoleStore, setConsoleData, updateConsole, showConsoleStore } from "../Store/ConsoleStore";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import VirtualList from "svelte-tiny-virtual-list";
  import { MessageStore } from "../Store/MessageStore";
  import { getEvent } from "src/ShareComponent/utils";

  let ref;
  let items = [];
  let toggle = true;
  let update = false;
  let dragger;
  let rconsole;
  let expanded = false;
  const state = { height: 120 };
  const tabRex = /configs|downloads|content-manager/;
  let canShow = tabRex.test(location.pathname);
  let scrollToIndex = 0;
  let height = 120;

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

  MessageStore.subscribe((data) => {
    if (data.msg) {
      updateConsole({ text: data.msg });
    }
  });

  const toggleConsole = () => {};

  const onNavigate = ({ currentTarget: { currentEntry } }) => {
    update = currentEntry.url;
  };

  const onExpand = () => {
    rconsole.style.height = expanded ? "120px" : "calc(100% - 205px)";
    expanded = !expanded;
    state.height = rconsole.offsetHeight;
    height = rconsole.offsetHeight;
    scrollToIndex = scrollToIndex - 2;
    setTimeout(() => {
      scrollToIndex = items.length - 1;
    }, 100);
  };

  const loadEvents = async (pg = 1) => {
    const result = await apiUtils.get(["admin", "downloader", "events", pg], "console");
    if (!result.error) {
      setConsoleData(result);
    }
  };

  const startResize = (e) => {
    state.dragge = true;
    const { clientY } = getEvent(e);
    state.y = clientY;
    state.height = rconsole.offsetHeight;
  };

  let getStycky = () => {
    let styckies = [];
    items.forEach((el, i) => {
      if (el.important) styckies.push(i);
    });
  };

  const resetState = (e) => (state.dragge = false);
  const onMouseMove = (e) => {
    if (state.dragge) {
      const { clientY } = getEvent(e);
      rconsole.style.height = state.height + state.y - clientY + "px";
      height = rconsole.offsetHeight;
    }
  };

  const removeListener = () => {
    socket.off("info", onData);
    socket.off("connect", loadEvents);
    window.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", resetState);
    document.removeEventListener("mouseleave", resetState);
    document.removeEventListener("touchend", resetState);
    navigation.removeEventListener("navigate", onNavigate);
  };

  removeListener();

  onMount(async () => {
    socket.on("info", onData);
    socket.on("connect", loadEvents);

    await loadEvents();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("mouseup", resetState);
    document.addEventListener("touchend", resetState);
    document.addEventListener("mouseleave", resetState);
    navigation.addEventListener("navigate", onNavigate);

    return removeListener;
  });

  afterUpdate(() => {
    setTimeout(() => {
      scrollToIndex = items.length - 1;
    }, 100);
  });

  const getSpanStyle = (index) => {
    const item = items[index];

    if (item.important) {
      return "color: rgb(255, 30, 0)";
    }

    if (item.color) {
      return `color: ${item.color};`;
    }

    return "color: green";
  };

  showConsoleStore.set(canShow && $ConsoleStore.length);
  $: if (update) {
    canShow = tabRex.test(update);
  }
  $: showConsoleStore.set(canShow && $ConsoleStore.length && toggle);
  $: props = { height: height - 10, width: "auto", itemSize: 25 };
  $: props2 = { itemCount: $ConsoleStore.length, scrollToIndex, stickyIndices: getStycky() };
</script>

<label on:keydown on:click={toggleConsole} class:toggle class:hidden={!canShow}>
  <input type="checkbox" bind:checked={toggle} />
  <Icons name="terminal" color="black" box="0 0 640 512" width="30px" height="20px" />
</label>
{#if canShow}
  <div class="cls-container" bind:this={rconsole} class:hide-dragg={items.length === 0 || !toggle}>
    <div class="dragger" bind:this={dragger} on:touchstart|passive={startResize} on:mousedown={startResize} />
    {#if toggle && items.length}
      <div class="r-console" on:dblclick={onExpand}>
        <span class="clean" on:keydown on:click={onClear}>
          <Icons name="trash" box="0 0 448 512" />
        </span>
        <VirtualList {...{ ...props, ...props2 }}>
          <div slot="item" let:index let:style class="console-item" {style} class:important={items[index].important}>
            {#if items[index].url}
              <a href={items[index].url} style="color: rgba(0, 123, 255, 0.95);" target="_blank">
                {items[index].text}
              </a>
            {:else}
              <span style={getSpanStyle(index)}>{items[index].text}</span>
            {/if}
          </div>
        </VirtualList>
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
    height: calc(100% - 5px);
    padding: 2px;
    background-color: white;
    border-radius: 0.25rem;
    padding-top: 5px;
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
    top: -5px;
    left: 0;
    height: 20px;
    width: 100%;
    background-color: transparent;
    cursor: ns-resize;
  }

  label {
    position: absolute;
    background: white;
    z-index: 99;
    right: 20px;
    top: 54px;
    padding: 2px;
    border-radius: 0.25rem;
  }
  input {
    display: none;
  }
  .r-console .clean {
    position: absolute;
    top: -2px;
    right: 5px;
    z-index: 1000;
    width: 15px;
  }
  .r-console .clean :global(svg) {
    height: 20px;
    width: 15px;
  }
  .r-console:empty {
    display: none;
  }
  .console-item {
    height: 100%;
    white-space: nowrap;
    text-align: left;
    background-color: white;
    color: black;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0 2px;
  }
  .console-item > * {
    padding-right: 40px;
  }
  .console-item.important {
    position: sticky;
    top: -5px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    pointer-events: none;
    color: rgba(255, 0, 0, 0.95);
  }
  .important span {
    background-color: white;
  }

  .toggle {
    background-color: rgba(0, 123, 255, 0.95);
  }

  .toggle :global(svg) {
    fill: white;
  }

  @media screen and (max-width: 620px) {
    .cls-container {
      max-height: calc(100% - 230px);
    }

    .important {
      font-size: 1.1rem;
    }
    .console-item {
      font-size: 0.8rem;
    }
  }
</style>
