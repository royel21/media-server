<script>
  import Icons from "src/icons/Icons.svelte";
  import Confirm from "src/admin/Component/Confirm.svelte";

  import { videoRegex } from "src/admin/Store/FilesStore";

  export let socket;
  export let selectedList;

  export let showConvertVideo;
  export let showVideoSubTract;

  let showConfirm = false;

  let show = false;

  const onConvertVideos = () => (showConvertVideo = true);

  const onShowExtractSubVideos = () => (showVideoSubTract = true);

  const confirmMerge = () => {
    socket.emit("bg-work", { action: "mergeVideos", data: { files: selectedList } });
  };

  const confirmVideoFix = () => {
    socket.emit("bg-work", { action: "fixVideo", data: { files: selectedList } });
  };

  const onVideoFix = () => {
    showConfirm = {
      acept: confirmVideoFix,
      text: "Video Fix",
    };
  };

  const onMergeVideo = () => {
    showConfirm = {
      acept: confirmMerge,
      text: "Merge",
    };
  };

  $: show = selectedList.filter((f) => !videoRegex.test(f.Name)).length === 0;
</script>

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
  <span id="video-fix" on:click={onVideoFix} title="Convert Videos">
    <Icons name="videofix" box="0 0 640 512" color="deepskyblue" />
    <Icons name="wrench" box="0 0 640 512" color="black" />
  </span>
  <span on:click={onShowExtractSubVideos} title="Extra Sub Video">
    <Icons name="videocut" box="0 0 640 512" color="deepskyblue" />
  </span>
  <span id="merge" on:click={onMergeVideo} title="Merge Videos">
    <Icons name="merge" box="0 0 576 512" color="deepskyblue" />
  </span>
{/if}

<style>
  #film2 :global(.icon-film2) {
    width: 21px;
    top: 5px;
    left: -4px;
  }
  #video-fix {
    position: relative;
  }
  #video-fix :global(.icon-videofix) {
    width: 30px;
    height: 25px;
    top: 0px;
    left: -8px;
  }

  #video-fix :global(.icon-wrench) {
    position: absolute;
    width: 16px;
    left: 1px;
  }
  #film2 {
    position: relative;
  }
  #film2 :global(.icon-videofix) {
    width: 30px;
    height: 25px;
    top: 0px;
    left: -8px;
  }

  #film2 :global(.icon-wrench) {
    position: absolute;
    width: 16px;
    left: 1px;
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
