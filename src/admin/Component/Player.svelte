<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { setGesture } from "src/ShareComponent/VideoTouch.js";
  import { formatTime } from "./util";
  import { afterUpdate, onMount, setContext } from "svelte";
  import { map } from "../Utils";
  import Icons from "src/icons/Icons.svelte";
  import Slider from "src/ShareComponent/Slider.svelte";
  import { FilesStore, videoRegex } from "../Store/FilesStore";

  const VOLKEY = "admin-vol";
  const SEEKLEFT = 37;
  const SEEKRIGHT = 39;
  const VOLUMEUP = 37;
  const VOLUMEDOWN = 40;
  const PLAY = 37;
  const CLOSE = 88;

  let file = {};
  let files = [];

  let duration = 0;
  let player;
  let time = 0;
  let vol = localStorage.getItem(VOLKEY) || 0.05;
  let mute = false;
  let ojectFit = "contain";
  let paused = true;
  let error = "";
  let current = files.findIndex((f) => f.Id === file.Id);

  FilesStore.subscribe((data) => {
    if (videoRegex.test(data.file.Name)) {
      file = data.file;
      files = data.files;
      player?.focus();
    }
  });
  const hide = () => {
    FilesStore.set({ file: {}, files: [] });
    file = {};
    files = [];
  };

  const onPlay = (e) => {
    if (paused) {
      player.play().catch((err) => console.log(err));
    } else {
      player.pause();
    }
  };

  const changeFile = ({ target: { id } }) => {
    let next = id === "next" ? 1 : -1;
    const nextIndex = current + next;
    if (nextIndex > -1 && nextIndex < files.length) {
      file = files[nextIndex];
      current = nextIndex;
    }
  };

  const onkeydown = ({ keyCode, ctrlKey }) => {
    const seekRate = ctrlKey ? 10 : 5;
    if (keyCode === SEEKLEFT) {
      player.currentTime = time - seekRate;
    }

    if (keyCode === SEEKRIGHT) {
      player.currentTime = time + seekRate;
    }

    if (keyCode === VOLUMEUP) {
      player.volume = map(player.volume + 0.05, 0, 1);
    }

    if (keyCode === VOLUMEDOWN) {
      player.volume = map(player.volume - 0.05, 0, 1);
    }

    if (keyCode === PLAY) onPlay();
    if (keyCode === CLOSE) hide();
  };

  const changeFit = () => {
    ojectFit = ojectFit.includes("fill") ? "contain" : "fill";
  };

  const onSeek = (seek) => {
    time = seek;
  };

  const onMute = () => (mute = !mute);

  const onWheel = ({ deltaY }) => {
    let volume = vol;
    volume += deltaY < 0 ? 0.05 : -0.05;
    vol = volume < 0 ? 0 : volume > 1 ? 1 : volume;
  };

  onMount(() => {});

  const getTimes = (time, duration) => {
    return duration ? `${formatTime(time)}/${formatTime(duration)}` : "00:00/00:00";
  };
  $: timeProgress = getTimes(time, duration);
  $: localStorage.setItem(VOLKEY, vol);

  $: if (file.Path !== player?.src) {
    error = "";
  }

  onMount(() => {
    stop = setGesture(player, onPlay, { seekRate: 5 });
    console.log("set touch");
    player.onerror = (err) => {
      error = `No Supported Sources ${file.Name}`;
    };

    return stop;
  });

  $: current = files.findIndex((f) => f.Id === file.Id);
</script>

<div class="player" on:wheel|passive={onWheel} class:hidden={!files.length}>
  <Dialog cancel={hide} btnOk="" btnCancer="" keydown={onkeydown} canDrag={true} background={false}>
    <span slot="modal-header" class="f-name">{file.Name}</span>
    <div class="video-container">
      <div class="error">{error}</div>
      <video
        autoplay={true}
        bind:this={player}
        bind:currentTime={time}
        bind:duration
        bind:volume={vol}
        bind:muted={mute}
        bind:paused
        tabindex="-1"
        src={`/api/admin/directories/video/${encodeURIComponent(file.Path)}`}
        style={`object-fit: ${ojectFit};`}
      />
    </div>
    <div class="v-seeker">
      <span class="time">{timeProgress}</span>
      <Slider min={0} max={duration} value={time} onChange={onSeek} preview={true} let:value>
        {formatTime(value)}
      </Slider>
    </div>
    <div class="time-progress" on:mousedown|stopPropagation on:touchstart|passive|stopPropagation>
      {#if files.length > 1}
        <span class="files-count">{`${current + 1}/${files.length}`}</span>
      {/if}
      <span class="admin-vol" on:click={onMute}>
        <Icons name={mute ? "volumemute" : "volume"} />
        <span>{parseInt(vol * 100)}%</span>
      </span>
      <span id="prev" class="btn-play" on:click={changeFile}>
        <Icons name="arrowcircleleft" />
      </span>
      <span class="btn-play play" on:click={onPlay}>
        <Icons name={paused ? "playcircle" : "pausecircle"} />
      </span>
      <span id="next" class="btn-play" on:click={changeFile}>
        <Icons name="arrowcircleright" />
      </span>
      <span class="close btn-play" on:click={() => hide()}>
        <Icons name="timescircle" />
      </span>
      <span class="fit" on:click={changeFit}>
        <Icons name="expandarrow" />
      </span>
    </div>
  </Dialog>
</div>

<style>
  .video-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .error {
    position: absolute;
  }
  .player :global(.modal-container .modal) {
    min-width: 600px;
    max-width: 600px;
    height: max-content;
    background-color: black;
    overflow: hidden;
  }

  .player :global(.modal-footer) {
    display: none;
  }

  .player :global(.modal-body) {
    padding: 0;
  }

  video {
    width: 100%;
    max-height: 400px;
    min-height: 345px;
    object-fit: fill;
    pointer-events: none;
  }
  .time-progress {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 28px;
  }

  .time-progress > .files-count {
    position: absolute;
    top: 1px;
    left: 4px;
    display: inline-block;
    border-radius: 0.25rem;
    padding: 0 5px;
    background-color: rgba(0, 0, 0, 0.2);
    user-select: none;
  }

  .time-progress :global(svg) {
    pointer-events: none;
  }

  .btn-play :global(svg) {
    top: 0px;
    cursor: pointer;
  }
  .btn-play.play {
    margin: 0 10px;
  }

  #next {
    margin-right: 10px;
  }

  .admin-vol {
    position: absolute;
    right: 5px;
    bottom: 2px;
    user-select: none;
  }

  .admin-vol :global(svg) {
    width: 20px;
    height: 20px;
  }
  .fit {
    position: absolute;
    bottom: 1px;
    right: 65px;
  }

  .v-seeker {
    display: flex;
    align-items: center;
    height: 30px;
  }

  .v-seeker > span {
    display: inline-block;
    padding-left: 10px;
    line-height: 1.8;
  }

  @media screen and (max-width: 600px) {
    .player :global(.modal-container .modal) {
      min-width: 95%;
      max-width: 95%;
    }
    .player video {
      min-width: initial;
      max-width: 100%;
      max-height: 400px;
      object-fit: fill;
    }
  }
</style>
