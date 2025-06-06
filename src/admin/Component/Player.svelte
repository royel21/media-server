<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { setGesture } from "src/ShareComponent/VideoTouch.js";
  import { formatTime } from "./util";
  export let hide;
  export let file;
  let duration = 0;
  let player;
  let time = 0;

  const onPlay = () => {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  };

  $: if (!player?.onmousedown) {
    setGesture(player, onPlay, { seekRate: 5 });
  }
</script>

<div class="player">
  <Dialog cancel={hide} btnOk="" btnCancer="">
    <div>
      <video
        bind:this={player}
        bind:currentTime={time}
        bind:duration
        src={`/api/admin/directories/video/${encodeURIComponent(file.Path)}`}
        controls={true}
      />
    </div>
  </Dialog>
</div>

<style>
  div {
    position: relative;
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
    max-width: 100%;
    max-height: 100%;
    min-height: 100%;
    background-color: black;
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
