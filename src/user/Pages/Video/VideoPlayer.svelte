<script>
  import { onMount, createEventDispatcher, getContext } from "svelte";

  import Slider from "./Slider.svelte";
  import { setfullscreen, formatTime } from "../pagesUtils";
  import Icons from "src/icons/Icons.svelte";
  import { setBatteryMetter } from "./videoUtil";
  import ModalConfig from "./ModalPlayerConfig.svelte";
  import { setGesture } from "src/ShareComponent/VideoTouch";

  export let KeyMap;
  export let file;
  export let viewer;
  export let removeFile;

  const { Fullscreen, SkipForward, SkipBack, VolumeUp, VolumeDown, Muted, ShowList } = KeyMap;

  const { NextFile, PrevFile, GotoStart, GotoEnd, PlayOrPause, FastForward, FastBackward } = KeyMap;

  const dispatch = createEventDispatcher();
  let mConfig = { volume: 0.5, pause: false, muted: false, seekRate: 5, autoPlayList: true, objectFit: "fill" };
  let player = {};
  let progress;
  let isFullScreen = false;
  let controls;
  let battLevel;
  let isNextFile = true;
  let volRef;
  const User = getContext("User");
  const configTag = `${User.username}-playerconfig`;

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

  const fullScreen = () => {
    setfullscreen(viewer);

    setTimeout(() => {
      if (player.paused) {
        controls.style.bottom = 0;
      } else {
        controls.style.bottom = -controls.offsetHeight + "px";
      }
    }, 150);
  };

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

  let volTiout;
  const showFullScrVol = () => {
    if (isFullScreen) {
      volRef.style.opacity = 1;
      clearTimeout(volTiout);
      volTiout = setTimeout(() => {
        volRef.style.opacity = 0;
      }, 2000);
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
    mConfig.volume = player.volume;
    showFullScrVol();
  };

  const onSkip = (seekRate) => {
    if (!player.seeking) {
      player.currentTime += seekRate;
    }
  };

  SkipForward.action = () => onSkip(+mConfig.seekRate);
  SkipBack.action = () => onSkip(-+mConfig.seekRate);
  FastForward.action = () => onSkip(+mConfig.seekRate + 5);
  FastBackward.action = () => onSkip(-(+mConfig.seekRate + 5));
  GotoStart.action = () => (player.currentTime = 0);
  GotoEnd.action = () => (player.currentTime = file.Duration - 5);
  VolumeUp.action = (e) => changeVol(e.ctrlKey ? -0.05 : -0.01);
  VolumeDown.action = (e) => changeVol(e.ctrlKey ? 0.05 : 0.01);
  Muted.action = () => (player.muted = !player.muted);
  Fullscreen.action = fullScreen;

  PlayOrPause.action = onPlay;

  setBatteryMetter((level) => {
    battLevel = 0;
  });

  const onFullscreen = () => (isFullScreen = document.fullscreenElement !== null);

  const onMeta = () => {
    if (!player.onmousedown) {
      setGesture(player, onPlay, mConfig);
    }
    player.currentTime = file.CurrentPos;
    player.onended = () => {
      clearTimeout(isNextFile);
      isNextFile = setTimeout(() => {
        if (player.ended && mConfig.autoPlayList) {
          NextFile.action();
        }
      }, 4000);
    };
  };

  let showConfig = false;
  const showVConfig = () => (showConfig = !showConfig);

  onMount(() => {
    clearTimeout(isNextFile);
    document.querySelector(".info").style.opacity = 1;
    window.addEventListener("fullscreenchange", onFullscreen);
    const tconfig = window.localStorage.getObject(configTag);
    if (tconfig) {
      for (let k of Object.keys(mConfig)) {
        mConfig[k] = tconfig[k] ?? mConfig[k];
      }
      player.muted = mConfig.muted;
      player.volume = mConfig.volume;
    }

    return () => {
      window.localStorage.setObject(configTag, mConfig);
      window.removeEventListener("fullscreenchange", onFullscreen);
      Fullscreen.action = null;
    };
  });
  $: mConfig.muted = player.muted;
  $: if (mConfig.pause) {
    document.querySelector(".f-name").style.opacity = 1;
  } else {
    document.querySelector(".f-name").style.opacity = 0;
  }
</script>

{#if file.Id}
  <div class="player-container" class:isFullScreen on:mousemove={hideControls} on:wheel={onWheel}>
    <div class="player-content">
      <span class="v-state">
        <span class="batt-state">{battLevel ? `${battLevel}` : ""}</span>
        <span id="v-progress" class="v-p">&#128337; {progress}</span>
      </span>
      <video
        bind:this={player}
        bind:paused={mConfig.pause}
        bind:volume={mConfig.volume}
        on:contextmenu|preventDefault
        on:loadedmetadata={onMeta}
        on:timeupdate={updateTime}
        class="player"
        preload="metadata"
        src={`/api/viewer/video/${file.Id}`}
        style={`object-fit: ${mConfig.objectFit}`}
        loop={false}
        controls={false}
        autoplay={true}
        poster={file.Cover}
      >
        <track kind="captions" />
      </video>
      <div class="player-controls" on:mousedown|stopPropagation bind:this={controls}>
        <div class="v-seeker">
          <span id="v-progress">{progress}</span>
          <Slider min={0} max={file.Duration} value={file.CurrentPos} onChange={onSeek} preview={true} let:value>
            {formatTime(value)}
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
          <span class="btn-screen" on:click={Fullscreen.action}>
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
          <span class="v-config" title="Player Config" on:click={showVConfig}>
            {#if showConfig}
              <ModalConfig hide={showVConfig} bind:playerConfig={mConfig} />
            {/if}
            <Icons name="cog" width="30px" height="24px" />
          </span>
          {#if User.role.includes("Manager")}
            <span class="remove" on:click={removeFile}><Icons name="trash" color="red" /></span>
          {/if}
          <slot />
        </div>
      </div>
    </div>
    <span class="vol-fullscreen" bind:this={volRef}>
      <Icons name={player.muted ? "volumemute" : "volume"} />
      <span>{parseInt(mConfig.volume * 100)}%</span>
    </span>
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
    margin: 0 5px;
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
    top: -2px;
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

  .vol-fullscreen {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 45px;
    padding: 2px;
    border-radius: 0.25rem;
    position: absolute;
    right: 5px;
    bottom: 5px;
    color: white;
    background-color: rgba(31, 31, 31, 0.661);
    pointer-events: 0;
    opacity: 0;
  }

  @media screen and (max-width: 700px) {
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
      margin: 0 4px;
    }
  }
  @media screen and (min-width: 700px) {
    .v-config {
      position: relative;
    }
  }

  @media screen and (max-height: 600px) {
    .player-content {
      height: 100%;
    }
  }

  @media screen and (max-width: 480px) {
    .v-vol > input {
      width: 110px;
    }

    .remove,
    .v-config {
      display: none;
    }
  }

  @media (pointer: none), (pointer: coarse) and (max-width: 640px) {
    .v-seeker {
      padding-bottom: 10px;
    }
    .player-controls {
      padding: 10px 0;
    }
  }
</style>
