<script>
  import Icons from "src/icons/Icons.svelte";
  import { ImageRegex, MangaRegex, setFiles, TextRex, videoRegex } from "../Store/FilesStore";
  export let file;
  export let files;
  export let fileColor = "grey";

  const handleClick = () => {
    setFiles({ file, files });
  };
</script>

<span class="f-play" on:click|stopPropagation={handleClick} title="Open Viewer">
  {#if videoRegex.test(file.Name)}
    <Icons name="play" box="0 0 512 512" color="deepskyblue" />
  {:else if MangaRegex.test(file.Name)}
    <Icons name="book" box="0 0 512 512" color="red" />
  {:else if TextRex.test(file.Name)}
    <Icons name="text" box="0 0 384 512" color="antiquewhite" />
  {:else if ImageRegex.test(file.Name)}
    <Icons name="image" box="0 0 512 512" color="cyan" />
  {:else}
    <Icons name="file" box="0 0 512 512" color={fileColor} />
  {/if}
</span>

<style>
  .f-play {
    margin-left: 5px;
  }

  .f-play :global(svg) {
    top: 4px;
    width: 20px;
    height: 18px;
    margin-left: 2px;
  }
  span {
    cursor: pointer;
  }

  span :global(.icon-text) {
    width: 16px;
  }

  span:active :global(svg) {
    transform: scale(1.1);
  }
</style>
