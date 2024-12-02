<script>
  import Icons from "src/icons/Icons.svelte";
  import List from "./List.svelte";

  export let files = [];
  export let fileId;
  export let onFilter;
  export let folderName = "";

  let hideList = true;
  let btnList;

  const onMousemove = () => {
    btnList.style.opacity = 1;
  };
</script>

<div
  id="p-bg"
  class:hidelist={!hideList}
  on:click|stopPropagation={(e) => (hideList = true)}
  tabindex="-1"
  on:mousemove={onMousemove}
>
  <label
    id="btn-playlist"
    class={"show-list" + (!hideList ? " move" : "")}
    for="p-hide"
    style="bottom: 35px"
    title="play-list"
    bind:this={btnList}
    on:click|stopPropagation={(e) => (hideList = !hideList)}
  >
    <span class="p-sort">
      <Icons name="list" width="30px" height="24px" />
    </span>
  </label>
  {#if !hideList}
    <List {files} {folderName} {onFilter} {fileId} on:click bind:hideList />
  {/if}
</div>

<style>
  #p-bg.hidelist {
    width: 100%;
  }
  #p-bg {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 34px;
    width: 0;
    z-index: 10;
  }

  #p-bg:hover #btn-playlist {
    opacity: 1;
  }

  label {
    margin: 0;
  }
  .show-list {
    position: fixed;
    right: 5px;
    bottom: 40px;
    transition: 0.3s all;
    z-index: 11;
    background-color: black;
    padding: 3px 0px 3px 6px;
    border-radius: 0.25rem;
    cursor: pointer;
    z-index: 99;
  }
  .move {
    right: 230px;
  }

  #play-list .p-controls .p-sort {
    margin: 0;
    width: 32px;
    font-size: 30px;
    padding: 0 8px;
    flex-grow: 0;
  }

  .b-control {
    text-align: center;
    position: absolute;
    bottom: 0px;
    width: 100%;
  }
</style>
