<script>
  import Icons from "../icons/Icons.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let filter = "";
  let curFilter = decodeURI(filter);

  const send = (text = "") => {
    curFilter = text;
    let ftl = text
      .replace("’", "'")
      .replace(/:|\?|\"/gi, "")
      .trim();
    dispatch("filter", encodeURI(ftl));
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
  <div class="input-group-prepend">
    <span class="btn-filter input-group-text" on:click={btnFilter}>
      <Icons name="search" height="22px" color="#495057" />
    </span>
  </div>
  <input
    type="text"
    class="form-control filter-file"
    placeholder="Filter"
    bind:value={curFilter}
    on:keydown={submitFilter}
  />
  <span id="clear-filter" on:click={ClearFilter}>
    <Icons name="timescircle" height="22px" color="black" />
  </span>
</div>

<style>
  #filter-control :global(svg) {
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
      width: 200px;
    }
  }
</style>
