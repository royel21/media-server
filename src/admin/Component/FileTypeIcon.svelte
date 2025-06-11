<script>
  import Icons from "src/icons/Icons.svelte";
  import { setPlayer, videoRegex } from "../Store/FilesStore";
  import { setViewer } from "../Store/MangaStore";
  export let file;
  export let mangas;
  export let videos;
  export let fileColor = "grey";
</script>

{#if videoRegex.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={() => setPlayer({ file, files: videos })} title="Play Video">
    <Icons name="play" box="0 0 512 512" color="deepskyblue" />
  </span>
{:else if /\.zip$/.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={() => setViewer({ file, files: mangas })}>
    <Icons name="book" box="0 0 512 512" color={"red"} />
  </span>
{:else}
  <span class="f-play">
    <Icons name="file" box="0 0 512 512" color={fileColor} />
  </span>
{/if}

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

  span:active :global(svg) {
    transform: scale(1.1);
  }
</style>
