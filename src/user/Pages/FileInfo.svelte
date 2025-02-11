<script>
  import Icons from "src/icons/Icons.svelte";
  import { isVideo } from "./pagesUtils";

  export let file;
  export let fileIndex;
  export let playList;
</script>

<span class="info" class:top={isVideo(file)}>
  <span id="files-prog">
    <Icons name="file" />
    {`${fileIndex + 1} / ${playList.length}`}
  </span>
  <div id="clock" />
</span>

<style>
  .info {
    display: inline-block;
    position: fixed;
    right: 0px;
    top: 0px;
    pointer-events: none;
    border-radius: 0.25rem 0 0 0;
    z-index: 4;
    padding: 2px 5px;
    background-color: rgba(0, 0, 0, 0.8);
    user-select: none;
  }
  #clock {
    display: inline-block;
    border-left: 1px solid;
    padding-left: 5px;
  }
  #clock:empty {
    display: none;
  }

  .info {
    transition: 1s opacity;
  }
</style>
