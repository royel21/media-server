<script>
  import Icons from "src/icons/Icons.svelte";
  import VideoConvert from "./VideoConvert.svelte";
  import SubVideoExtration from "./SubVideoExtration.svelte";
  import Confirm from "../Component/Confirm.svelte";
  import { videoRegex } from "../Store/FilesStore";

  export let socket;
  export let selectedList;
  export let bgWorking = false;

  let showConvertVideo;
  let showVideoSubTract;
  let showConfirm = false;

  let show = false;

  const onConvertVideos = () => (showConvertVideo = true);

  const convertVideos = (options) => {
    socket.emit("bg-work", { action: "convertVideo", data: { files: selectedList, ...options } });
    showConvertVideo = false;
    bgWorking = true;
  };

  const onShowExtractSubVideos = () => (showVideoSubTract = true);

  const extractSubVideo = (options) => {
    socket.emit("bg-work", { action: "extractSubVideo", data: { file: selectedList[0], ...options } });
    showVideoSubTract = false;
    bgWorking = true;
  };

  const confirmMerge = () => {
    socket.emit("bg-work", { action: "mergeVideos", data: { files: selectedList } });
  };

  const onMergeVideo = () => {
    showConfirm = {
      acept: confirmMerge,
      text: "Merge",
    };
  };

  $: show = selectedList.filter((f) => !videoRegex.test(f.Name)).length === 0;
  $: count = selectedList.filter((f) => videoRegex.test(f.Name)).length;
</script>

{#if showConvertVideo}
  <VideoConvert hide={() => (showConvertVideo = false)} acept={convertVideos} />
{/if}

{#if showVideoSubTract}
  <SubVideoExtration hide={() => (showVideoSubTract = false)} acept={extractSubVideo} />
{/if}

{#if showConfirm}
  <Confirm
    text={`${showConfirm.text} ${selectedList.length} Selected ${selectedList.length === 1 ? "File" : "Files"}`}
    acept={showConfirm.acept}
    cancel={() => (showConfirm = false)}
    data={showConfirm.data}
  />
{/if}

{#if show}
  <span id="film2" on:click={onConvertVideos} title="Convert Videos">
    <Icons name="film2" box="0 0 512 512" color="deepskyblue" />
  </span>
  {#if count === 1}
    <span on:click={onShowExtractSubVideos} title="Extra Sub Video">
      <Icons name="videocut" box="0 0 640 512" color="deepskyblue" />
    </span>
  {:else}
    <span id="merge" on:click={onMergeVideo} title="Merge Videos">
      <Icons name="merge" box="0 0 576 512" color="deepskyblue" />
    </span>
  {/if}
{/if}

<style>
  #film2 :global(.icon-film2) {
    width: 21px;
    top: 5px;
  }

  #merge :global(.icon-merge) {
    width: 21px;
    top: 5px;
  }
  span {
    position: relative;
    display: inline-block;
    width: 30px;
    padding: 0 5px;
    text-align: center;
  }
</style>
