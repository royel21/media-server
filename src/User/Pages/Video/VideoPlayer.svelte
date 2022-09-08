<script>
  import { onMount, createEventDispatcher } from "svelte";

  import Slider from "./Slider.svelte";
  import { setfullscreen, formatTime } from "../Utils";
  import { setGesture } from "./VideoTouch";

  export let KeyMap;
  export let file;
  export let viewer;

  const { NextFile, PrevFile } = KeyMap;
  const dispatch = createEventDispatcher();
  let mConfig = { time: false, volume: 0.5, pause: false, muted: false };
  let player = {};
  let progress;
  let isFullScreen = false;
  let controls;

  const onMeta = (e) => {
    player.currentTime = file.CurrentPos;
  };

  const onReturn = () => {
    dispatch("returnBack");
  };
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
  };
  const volChange = ({ target: { value } }) => {
    mConfig.volume = value;
  };
  const onFullscreen = () => (isFullScreen = document.fullscreenElement !== null);

  onMount(() => {
    setGesture(player);
    window.addEventListener("fullscreenchange", onFullscreen);
    return () => window.removeEventListener("fullscreenchange", onFullscreen);
  });
  let tout;
  const hideControls = () => {
    if (isFullScreen && window.innerWidth > 1000) {
      controls.style.bottom = 0;
      clearTimeout(tout);
      tout = setTimeout(() => {
        controls.style.bottom = -controls.offsetHeight + "px";
      }, 5000);
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
  const onPlay = ({ target: { checked } }) => (!checked ? player.play() : player.pause());

  const hideControlsOnCLick = () => {
    if (isFullScreen) {
      if (controls.style.bottom == "0px") {
        controls.style.bottom = -controls.offsetHeight + "px";
        player.play();
      } else {
        controls.style.bottom = 0;
        player.pause();
      }
    }
  };
  const handleKeyboard = ({ keyCode, ctrlKey }) => {
    switch (keyCode) {
      case 13: {
        fullScreen();
        break;
      }
      case 39: {
        player.currentTime += ctrlKey ? 10 : 5;
        break;
      }
      case 37: {
        player.currentTime -= ctrlKey ? 10 : 5;
        break;
      }
      case 38: {
        let newVol = player.volume + 0.05;
        player.volume = newVol > 1.0 ? 1 : newVol;
        break;
      }
      case 40: {
        let newVol = player.volume - 0.05;
        player.volume = newVol < 0 ? 0 : newVol;
        break;
      }
      case 32: {
        player.paused ? player.play() : player.pause();
        break;
      }
    }
  };
</script>

{#if file.Id}
  <div
    class="player-container"
    class:isFullScreen
    on:mousemove={hideControls}
    tabindex="0"
    on:keydown={handleKeyboard}
    on:wheel={onWheel}
  >
    <div class="player-content">
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
        on:click={hideControlsOnCLick}
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
          <span on:click={onReturn}> <i class="far fa-times-circle" /> </span>
          <span class="prev-page" on:click={PrevFile.action}>
            <i class="far fa-arrow-alt-circle-left" />
          </span>
          <label for="v-play">
            <input name="play-button" type="checkbox" id="v-play" on:change={onPlay} />
            <i class={`far fa-${mConfig.pause ? "play" : "pause"}-circle`} />
          </label>
          <span class="next-page" on:click={NextFile.action}>
            <i class="far fa-arrow-alt-circle-right" />
          </span>
          <span on:click={fullScreen}>
            <i class="fas fa-expand-arrows-alt" />
          </span>
          <span class="v-vol">
            <input
              name="vol-range"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={mConfig.volume}
              on:input={volChange}
            />
            <label for="v-mute">
              <input
                name="mute-volumen"
                id="v-mute"
                type="checkbox"
                class="vol-ctrl"
                checked={mConfig.volume === 0}
                on:change={onMuted}
              />
              <i class="fas fa-volume-up popup-msg" data-title="Mute" />
            </label>
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  input[type="checkbox"] {
    display: none;
  }

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
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 65%;
    max-width: 1280px;
    max-height: 780px;
    margin: 10px;
    padding: 5px;
    border: 1px solid;
    border-radius: 0.5rem;
    background-color: black;
  }

  .player {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
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
  #v-mute + .fa-volume-up {
    display: inline-block;
    width: 30px;
    margin-left: 5px;
  }

  #v-mute:checked + i:before {
    content: "\f6a9";
  }

  .v-vol {
    position: absolute;
    right: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    line-height: 1.3;
  }
  label i,
  span i {
    font-size: 25px;
    margin: 0 10px;
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
  .isFullScreen .v-vol {
    position: initial;
  }

  @media screen and (max-width: 1600px) {
    .player-content {
      width: 70%;
    }
  }

  @media screen and (max-width: 1300px) {
    .player-content {
      width: 80%;
    }
  }

  @media screen and (max-width: 600px) {
    .v-vol {
      position: initial;
    }
    .player-content {
      width: 100%;
    }
  }
</style>
