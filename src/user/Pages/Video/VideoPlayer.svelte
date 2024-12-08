<script>
  import { onMount, createEventDispatcher } from "svelte";

  import Slider from "./Slider.svelte";
  import { setfullscreen, formatTime } from "../pagesUtils";
  import { setGesture } from "./VideoTouch";
  import Icons from "src/icons/Icons.svelte";
  import { setBatteryMetter } from "./videoUtil";

  export let KeyMap;
  export let file;
  export let viewer;

  const { Fullscreen, SkipForward, SkipBack, VolumeUp, VolumeDown, Muted, ShowList } = KeyMap;

  const { NextFile, PrevFile, GotoStart, GotoEnd, PlayOrPause, FastForward, FastBackward } = KeyMap;

  const dispatch = createEventDispatcher();
  let mConfig = { time: false, volume: 0.5, pause: false, muted: false };
  let player = {};
  let progress;
  let isFullScreen = false;
  let controls;
  let battLevel;

  const onReturn = () => dispatch("returnBack");

  const onSeek = (value) => {
    player.currentTime = value;
  };

  $: if (player) {
    progress = formatTime(file.CurrentPos) + "/" + formatTime(file.Duration);
  }
  const onMuted = ({ target }) => {
    player.muted = target.checked;
  };

  const fullScreen = () => setfullscreen(viewer);

  const volChange = ({ target: { value } }) => {
    mConfig.volume = value;
  };

  let tout;
  const hideControls = () => {
    if (isFullScreen && window.innerWidth > 1000) {
      controls.style.bottom = 0;
      clearTimeout(tout);
      tout = setTimeout(() => {
        controls.style.bottom = -controls.offsetHeight + "px";
      }, 4000);
    }
  };

  const onWheel = ({ deltaY }) => {
    let { volume } = mConfig;
    volume += deltaY < 0 ? 0.05 : -0.05;
    mConfig.volume = volume < 0 ? 0 : volume > 1 ? 1 : volume;
  };

  const updateTime = () => {
    file.CurrentPos = player.currentTime;
  };

  const onPlay = () => {
    if (player.paused) {
      controls.style.bottom = -controls.offsetHeight + "px";
      player.play().catch(() => {});
    } else {
      if (isFullScreen) {
        controls.style.bottom = 0;
      }
      player.pause();
    }
  };

  const changeVol = (val) => {
    let newVol = player.volume + val;
    player.volume = newVol < 0 ? 0 : newVol;
  };

  SkipForward.action = () => (player.currentTime += 5);
  SkipBack.action = () => (player.currentTime -= 5);
  FastForward.action = () => (player.currentTime += 10);
  FastBackward.action = () => (player.currentTime -= 10);
  GotoStart.action = () => (player.currentTime = 0);
  GotoEnd.action = () => (player.currentTime = file.Duration - 5);
  VolumeUp.action = () => changeVol(-0.05);
  VolumeDown.action = () => changeVol(0.05);
  Muted.action = () => (player.muted = !player.muted);
  Fullscreen.action = fullScreen;

  PlayOrPause.action = onPlay;

  setBatteryMetter((level) => {
    battLevel = 0;
  });

  const onFullscreen = () => (isFullScreen = document.fullscreenElement !== null);

  const onMeta = () => {
    if (!player.onmousedown) {
      setGesture(player, onPlay);
    }
    player.currentTime = file.CurrentPos;
  };

  onMount(() => {
    window.addEventListener("fullscreenchange", onFullscreen);
    return () => window.removeEventListener("fullscreenchange", onFullscreen);
  });
</script>

{#if file.Id}
  <div class="player-container" class:isFullScreen on:mousemove={hideControls} on:wheel={onWheel}>
    <div class="player-content">
      <span class="v-state">
        <span class="batt-state">{battLevel ? `${battLevel}` : ""}</span>
        <span id="v-progress" class="v-p">&#128337; {progress}</span>
      </span>
      <video
        class="player"
        src={`/api/viewer/video/${file.Id}`}
        bind:this={player}
        bind:paused={mConfig.pause}
        bind:volume={mConfig.volume}
        preload="metadata"
        controls={false}
        on:contextmenu|preventDefault
        autoplay={true}
        poster={file.Cover}
        loop={false}
        on:loadedmetadata={onMeta}
        on:timeupdate={updateTime}
      >
        <track kind="captions" />
      </video>
      <div class="player-controls" on:mousedown|stopPropagation bind:this={controls}>
        <div class="v-seeker">
          <span id="v-progress">{progress}</span>
          <Slider min={0} max={file.Duration} value={file.CurrentPos} onChange={onSeek} preview={true} let:value>
            {formatTime(value + 2)}
          </Slider>
        </div>
        <div class="player-btns">
          <span on:click={onReturn}>
            <Icons name="timescircle" />
          </span>
          <span class="prev-page" on:click={PrevFile.action}>
            <Icons name="arrowcircleleft" />
          </span>
          <label for="v-play">
            <input name="play-button" type="checkbox" id="v-play" on:change={onPlay} />
            <Icons name={mConfig.pause ? "playcircle" : "pausecircle"} />
          </label>
          <span class="next-page" on:click={NextFile.action}>
            <Icons name="arrowcircleright" />
          </span>
          <span class="btn-screen" on:click={fullScreen}>
            <Icons name="expandarrow" />
          </span>
          <span class="v-vol">
            <label for="v-mute" class="v-volume">
              <input
                name="mute-volumen"
                id="v-mute"
                type="checkbox"
                class="vol-ctrl"
                checked={mConfig.volume === 0 || player.muted}
                on:change={onMuted}
              />
              <Icons name={player.muted ? "volumemute" : "volume"} />
            </label>
            <input
              name="vol-range"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={mConfig.volume}
              on:input={volChange}
            />
          </span>
          <label class="show-list" for="p-hide" title="play-list" on:click={ShowList.action}>
            <span class="p-sort">
              <Icons name="list" width="30px" height="24px" />
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .player-container {
    display: flex;
    height: 100%;
    width: 100%;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    outline: none;
  }
  .player-content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 98%;
    min-width: 95%;
    margin: 10px;
    padding: 5px;
    border: 1px solid;
    border-radius: 0.5rem;
    background-color: black;
  }
  .v-state {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    padding: 0 4px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 0 0 0.25rem 0;
  }
  .batt-state:empty {
    display: none;
  }
  .isFullScreen .v-state {
    display: inline-block;
  }
  :global(.viewer .icon-file) {
    display: none;
  }
  .player-btns :global(svg) {
    height: 26px;
    width: 32px;
    top: 0px;
  }
  .v-volume {
    margin-right: 5px;
  }
  .player-btns *:not(.v-volume) {
    margin: 0 15px;
  }
  .player-btns .btn-screen {
    margin-right: 0px;
  }
  .player-btns .v-volume :global(svg) {
    margin-left: 8px;
    top: 1px;
  }
  input[type="checkbox"] {
    display: none;
  }

  .player {
    width: 100%;
    max-width: 100%;
    max-height: calc(100% - 59px);
    min-height: calc(100% - 59px);
    object-fit: fill;
    background-color: black;
  }
  .player-controls {
    transition: 0.3s all;
  }
  .v-seeker {
    display: flex;
    align-items: center;
  }

  .v-seeker > span {
    display: inline-block;
    padding-left: 10px;
    line-height: 1.8;
  }

  .player-btns {
    position: relative;
    display: flex;
    justify-content: center;
    height: 30px;
  }
  input[type="range"] {
    position: relative;
    top: -1px;
  }

  .v-vol {
    right: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    line-height: 1.3;
  }

  .isFullScreen .player,
  .isFullScreen .player-content {
    height: 100%;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0px;
    padding: 0px;
    border: none;
  }
  .isFullScreen .player-controls {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1;
  }

  .isFullScreen .v-seeker {
    padding: 5px 0px 15px 0;
  }
  @media screen and (max-width: 800px) {
    .show-list {
      position: absolute;
      right: -10px;
      bottom: -3px;
    }
  }

  @media screen and (max-height: 600px) {
    .player-content {
      height: 100%;
    }
  }

  @media screen and (max-width: 600px) {
    .v-vol {
      position: initial;
    }
    .player-content {
      width: 100%;
      height: initial;
      margin: 0;
      padding: 0;
      border: initial;
    }

    :global(body #play-list) {
      bottom: 0 !important;
    }

    .player-btns *:not(.v-volume) {
      margin: 0 5px;
    }
  }
</style>
