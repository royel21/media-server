<script>
  import Icons from "../icons/Icons.svelte";
  import { createEventDispatcher } from "svelte";
  export let filter = "";

  const dispatch = createEventDispatcher();

  let curFilter = /%/.test(filter) ? decodeURIComponent(filter) : filter;

  const send = (text = "") => {
    curFilter = text;
    let ftl = text
      .replace("’", "'")
      .replace(/:|\?|\"| Raw$/gi, "")
      .trim();
    dispatch("filter", encodeURIComponent(ftl.replace(/ \(official( \& Uncensored|)\)$/i, "")));
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
</script>

<div id="filter-control" class="input-group">
  <slot name="pre-btn" />
  <div class="input-group-prepend">
    <span class="btn-filter input-group-text" on:click={btnFilter}>
      <Icons name="search" height="22px" color="#495057" />
    </span>
  </div>
  <input
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
  #filter-control :global(.icon-search) {
    top: 0px;
  }

  #filter-control :global(.icon-timescircle) {
    top: 3px;
    right: -7px;
  }

  #filter-control {
    position: relative;
    flex-shrink: 1;
    width: 100%;
    pointer-events: all;
    max-width: 350px;
  }
  #filter-control > * {
    height: 32px;
  }
  .filter-file {
    padding: 2px 5px;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  @media screen and (max-width: 600px) {
    #filter-control {
      width: 220px;
    }
  }
</style>
