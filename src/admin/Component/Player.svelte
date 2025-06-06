<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { setGesture } from "src/ShareComponent/VideoTouch.js";
  import { formatTime } from "./util";
  import { onMount } from "svelte";
  import { map } from "../Utils";
  import Icons from "src/icons/Icons.svelte";
  export let hide;
  export let file;
  let duration = 0;
  let player;
  let time = 0;
  let vol = 0.5;
  let mute = false;

  const onPlay = (e) => {
    if (player.paused) {
      player.play().catch((err) => console.log(err));
    } else {
      player.pause();
    }
  };

  const onkeydown = ({ keyCode }) => {
    if (keyCode === 37) {
      player.currentTime = time - 5;
    }

    if (keyCode === 39) {
      player.currentTime = time + 5;
    }

    if (keyCode === 38) {
      player.volume = map(player.volume + 0.05, 0, 1);
    }

    if (keyCode === 40) {
      player.volume = map(player.volume - 0.05, 0, 1);
    }
  };

  onMount(() => {
    setGesture(player, onPlay, { seekRate: 5 });
  });
</script>

<div class="player">
  <Dialog cancel={hide} btnOk="" btnCancer="" keydown={onkeydown}>
    <div class="video-container">
      <video
        bind:this={player}
        bind:currentTime={time}
        bind:duration
        on:mousedown|preventDefault
        on:mouseup|preventDefault
        bind:volume={vol}
        bind:muted={mute}
        tabindex="-1"
        src={`/api/admin/directories/video/${encodeURIComponent(file.Path)}`}
      />
    </div>
    <div class="time-progress">
      <span class="time">{time ? `${formatTime(time)}/${formatTime(duration)}` : "00:00/00:00"}</span>
      <progress value={time / duration || 0}></progress>
      <span class="admin-vol">
        <Icons name={mute ? "volumemute" : "volume"} />
        <span>{parseInt(vol * 100)}%</span>
      </span>
    </div>
  </Dialog>
</div>

<style>
  .video-container {
    position: relative;
    height: 336px;
  }
  .player :global(.modal-container .modal) {
    min-width: 600px;
    max-width: 600px;
    height: max-content;
  }

  .player :global(.modal-footer) {
    display: none;
  }

  .player :global(.modal-body) {
    padding: 0;
  }

  video {
    width: 100%;
    object-fit: fill;
  }
  .time-progress {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 28px;
  }

  .time-progress > .time {
    display: inline-block;
    padding: 0 5px;
    background-color: rgba(0, 0, 0, 0.2);
  }

  progress {
    display: block;
    width: 100%;
    height: 100%;
    -webkit-appearance: none;
    appearance: none;
  }

  progress::-webkit-progress-bar {
    background-color: rgba(0, 0, 0, 0.2);
  }

  progress::-webkit-progress-value {
    background-color: rgba(255, 255, 255, 0.6);
  }

  .admin-vol {
    position: absolute;
    right: 5px;
    bottom: 4px;
  }

  .admin-vol :global(svg) {
    width: 20px;
    height: 20px;
  }

  @media screen and (max-width: 600px) {
    .player :global(.modal-container .modal) {
      min-width: 95%;
      min-width: 95%;
    }
    .player video {
      min-width: initial;
      max-width: 100%;
      object-fit: fill;
    }
  }
</style>
