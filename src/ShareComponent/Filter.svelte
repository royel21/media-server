<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  let filter = "";
  let showBack = false;

  const ClearFilter = () => {
    dispatch("filter", "");
    filter = "";
  };

  const submitFilter = e => {
    console.log(e.keyCode);
    if (e.keyCode === 13) {
      dispatch("filter", filter);
    }
  };

  const btnFilter = () => {
    dispatch("filter", filter);
  };

  const exitFolder = () => dispatch("exitFolder");
</script>

<style>
  #filter-control {
    position: relative;
    flex-shrink: 1;
    width: 100%;
  }
  .filter-file {
    padding: 2px 5px;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .filter-file:not(:placeholder-shown),
  .filter-file:focus {
    position: absolute;
    left: 46px;
    height: 100%;
    width: 100%;
  }
  .filter-file:not(:placeholder-shown) + span {
    right: -40px;
  }
</style>

<div id="filter-control" class="input-group">
  {#if showBack}
    <span className="badge badge-secondary mx-2" on:click={exitFolder}>
      <i className="fas fa-arrow-circle-left" />
    </span>
  {/if}
  <div class="input-group-prepend">
    <span class="btn-filter input-group-text" on:click={btnFilter}>
      <i class="fas fa-search" />
    </span>
  </div>
  <input
    type="text"
    class="form-control filter-file"
    placeholder="Filter"
    bind:value={filter}
    on:keydown={submitFilter} />
  <span id="clear-filter" on:click={ClearFilter}>
    <i class="fas fa-times-circle" />
  </span>
</div>
