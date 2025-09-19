<script>
  import Icons from "src/icons/Icons.svelte";
  import Confirm from "src/admin/Component/Confirm.svelte";

  import { videoRegex } from "src/admin/Store/FilesStore";
  import { onMount } from "svelte";
  import VideoConvert from "./VideoConvert.svelte";
  import SubVideoExtration from "./SubVideoExtration.svelte";

  export let socket;
  export let selectedList;
  export let bgWorking;

  let showConvertVideo = false;
  let showVideoSubTract = false;

  let showConfirm = false;
  let menuCheck;

  let show = false;

  const onConvertVideos = () => (showConvertVideo = true);

  const onShowExtractSubVideos = () => (showVideoSubTract = true);

  const confirmMerge = () => {
    bgWorking = true;
    socket.emit("bg-work", { action: "mergeVideos", data: { files: selectedList } });
  };

  const confirmVideoFix = () => {
    bgWorking = true;
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

  const onHideMenu = ({ target }) => {
    if (menuCheck && target !== menuCheck) {
      menuCheck.checked = false;
    }
  };

  onMount(() => {
    document.body.addEventListener("click", onHideMenu);

    return () => {
      document.body.removeEventListener("click", onHideMenu);
    };
  });

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

{#if showConvertVideo}
  <VideoConvert bind:showConvertVideo bind:bgWorking {socket} {selectedList} />
{/if}

{#if showVideoSubTract}
  <SubVideoExtration bind:showVideoSubTract bind:bgWorking {socket} {selectedList} />
{/if}

{#if show}
  <label for="video-menu">
    <Icons name="film2" box="0 0 512 512" color="deepskyblue" />
    <input type="checkbox" id="video-menu" bind:this={menuCheck} />
    <div class="v-menu">
      <div id="film2" on:click={onConvertVideos}>Convert Videos</div>
      <div id="video-fix" on:click={onVideoFix}>Fix Videos</div>
      <div on:click={onShowExtractSubVideos}>Extra Sub Video</div>
      <div id="merge" on:click={onMergeVideo}>Merge Videos</div>
    </div>
  </label>
{/if}

<style>
  label {
    position: relative;
  }
  .v-menu {
    display: none;
    position: absolute;
    top: 35px;
    background-color: rgb(58, 58, 58);
    min-width: max-content;
    z-index: 99;
    text-align: left;
    border-radius: 0.3rem;
    overflow: hidden;
  }
  .v-menu:after {
    position: absolute;
    top: -10px;
    left: -50px;
    width: 10;
    height: 10;
    transform: rotate(90deg);
    z-index: 100;
  }
  .v-menu div {
    padding: 4px 8px;
  }
  .v-menu div:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.5);
  }
  input {
    display: none;
  }
  input:checked + .v-menu {
    display: flex;
    flex-direction: column;
  }
  label :global(.icon-film2) {
    width: 21px;
    top: 5px;
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
</style>
