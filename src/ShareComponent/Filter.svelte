<script>
  import Icons from "../icons/Icons.svelte";
  import { createEventDispatcher } from "svelte";
  export let filter = "";
  export let id = "filter-control";

  const dispatch = createEventDispatcher();

  let curFilter = /%/.test(filter) ? decodeURIComponent(filter) : filter;

  const send = (text = "") => {
    curFilter = text;
    let ftl = text
      .replace("’", "'")
      .replace(/:|\?|\"| Raw$/gi, "")
      .trim();
    dispatch("filter", encodeURIComponent(ftl.replace(/ (\[|\(|)official(\]|\)|)$/i, "")));
  };

  const ClearFilter = () => send("");

  const submitFilter = (e) => {
    if (e.keyCode === 13) send(curFilter);
  };

  const btnFilter = async () => {
    let text = (await navigator.clipboard?.readText()) || "";
    if (!text) {
      text = curFilter;
    }
    send(text);
  };

  $: filter = curFilter;
</script>

<div {id} class="input-group c-filter">
  <slot name="pre-btn" />
  <div class="input-group-prepend">
    <span class="btn-filter input-group-text" on:click={btnFilter}>
      <Icons name="search" height="22px" color="#495057" />
    </span>
  </div>
  <input
    id="filter-input"
    type="text"
    class="form-control filter-file"
    placeholder="Filter"
    enterkeyhint="done"
    autocomplete="off"
    bind:value={curFilter}
    on:keydown={submitFilter}
  />
  <span id="clear-filter" on:click={ClearFilter}>
    <Icons name="timescircle" height="22px" color="black" />
  </span>
</div>

<style>
  .c-filter :global(.icon-search) {
    top: 0px;
  }

  .c-filter {
    display: flex;
    position: relative;
    flex-shrink: 1;
    width: 100%;
    pointer-events: all;
    height: 32px;
    max-width: 350px;
    align-items: center;
  }
  .c-filter > input {
    height: 30px;
    padding-right: 10px;
  }
  .filter-file {
    padding: 2px 5px;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  #clear-filter {
    position: absolute;
    top: 0px;
    right: 2px;
    z-index: 99;
    color: darkgray;
    font-size: 20px;
    height: 20px;
  }
</style>
