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

{#if videoRegex.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={handleClick} title="Play Video">
    <Icons name="play" box="0 0 512 512" color="deepskyblue" />
  </span>
{:else if MangaRegex.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={handleClick}>
    <Icons name="book" box="0 0 512 512" color="red" />
  </span>
{:else if TextRex.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={handleClick}>
    <Icons name="text" box="0 0 384 512" color="antiquewhite" />
  </span>
{:else if ImageRegex.test(file.Name)}
  <span class="f-play" on:click|stopPropagation={handleClick}>
    <Icons name="image" box="0 0 512 512" color="cyan" />
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
