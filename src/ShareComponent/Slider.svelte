<script>
  import { onDestroy } from "svelte";

  import { map, clamp } from "@share/utils";
  import { isMobile } from "src/utils";
  export let value;
  export let preview = false;
  export let min = 0;
  export let max = 100;
  export let onChange;

  let uniqId = "rc-" + new Date().getTime();
  let sliderRef;
  let previewRef;
  let previewData = 0;
  let progress = map(value, min, max, 0, 100);

  let isMdown = { is: false };

  const getLeft = (t) => t.getBoundingClientRect().left;

  const updateValue = (val) => {
    let tempVal = Number(map(val - 1, 0, sliderRef.offsetWidth - 2, min, max).toFixed(2));
    tempVal = tempVal < 0 ? 0 : tempVal > max ? max : tempVal;
    if (tempVal > -0.01) {
      onChange(tempVal);
    }
  };

  const onMDown = (e) => {
    isMdown = { is: true, id: uniqId };
    let xpos;

    if (e.type === "touchstart") {
      let tch = e.touches[0];
      xpos = tch.pageX - getLeft(tch.target);
      document.addEventListener("touchmove", globalMMove, { passive: true });
    } else {
      xpos = e.offsetX;
      document.addEventListener("mousemove", globalMMove, { passive: true });
    }

    if (!isNaN(xpos)) {
      updateValue(xpos);
    }
  };

  const globalMMove = (e) => {
    if (isMdown.is && e.target.id === uniqId) {
      let newPos;
      if (e.type === "touchmove") {
        let tch = e.touches[0];
        newPos = tch.pageX - getLeft(tch.target);
      } else {
        newPos = e.offsetX;
      }
      if (newPos > 0 && newPos < sliderRef.offsetWidth) {
        updateValue(newPos);
      }
    }
  };

  const onPreview = (e) => {
    if (preview) {
      const left = sliderRef.getBoundingClientRect();
      let newPos = Math.floor(e.pageX - getLeft(sliderRef));
      let tempVal = map(newPos - 1, 0, sliderRef.offsetWidth - 2, min, max).toFixed(2);
      let value = clamp(tempVal, 0, max) + 0.02;
      const pos = 4 + e.clientX - left.x - (previewRef?.offsetWidth || 0) / 2;
      previewData = { pos, value };
    }
  };

  document.onmouseup = (e) => {
    isMdown = false;
    document.removeEventListener("touchmove", globalMMove);
    document.removeEventListener("mousemove", globalMMove);
  };

  const handleThumb = (e) => {
    isMdown = { is: true, id: uniqId };
    if (e.type === "touchstart") {
      document.addEventListener("touchmove", globalMMove, { passive: true });
    } else {
      document.addEventListener("mousemove", globalMMove, { passive: true });
    }
  };

  $: progress = map(value, min, max, 0, 100);

  onDestroy(() => {
    document.removeEventListener("mousemove", globalMMove);
    document.removeEventListener("touchmove", globalMMove);
  });
</script>

<div class="rc-slider usn">
  <div id="track-container">
    <div
      id={uniqId}
      class="rc-track"
      on:mousedown|stopPropagation={onMDown}
      on:touchstart|passive|stopPropagation={onMDown}
      bind:this={sliderRef}
      on:mousemove={onPreview}
    >
      <div class="rc-t">
        <div class="rc-progress" style={`width: ${progress?.toFixed(2) || 0}%`} />
      </div>
      {#if !isMobile()}
        <span
          class="rc-thumb"
          style={`left: calc(${progress}% - 11px)`}
          on:touchstart|passive|stopPropagation={handleThumb}
          on:mousedown|stopPropagation={handleThumb}
        />
      {/if}
      {#if preview}
        <span class="rc-preview" data-title="00:00" bind:this={previewRef} style={`left: ${previewData.pos}px`}>
          <span class="rc-preview-content">
            <slot value={previewData.value} />
          </span>
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  div,
  span {
    user-select: none;
  }
  #track-container {
    width: 100%;
    padding: 0 20px;
  }
  .rc-slider {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    margin: auto;
    height: 10px;
    cursor: pointer;
  }
  .rc-slider .rc-track,
  .rc-slider .rc-progress {
    position: relative;
    width: 100%;
    height: 10px;
    background-color: wheat;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.25) inset;
  }
  .rc-track {
    border-radius: 0.3rem;
  }

  .rc-t {
    width: 100%;
    overflow: hidden;
    border-radius: 0.3rem;
    pointer-events: none;
  }

  .rc-slider .rc-progress {
    background-color: aqua;
    pointer-events: none;
    width: 0%;
  }

  .rc-slider .rc-thumb {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: calc(50% - 11px);
    margin: 0;
    z-index: 3;
    height: 22px;
    width: 22px;
    border-radius: 50%;
    background-color: wheat;
    box-shadow: 0 0px 3px rgba(0, 0, 0, 0.25);
  }

  .rc-slider .rc-thumb:active {
    transform: scale(1.2);
  }

  .rc-slider:hover .rc-progress,
  .rc-slider:hover .rc-track {
    height: 10px;
  }

  .rc-slider:hover .rc-thumb {
    visibility: visible;
  }

  .rc-slider .rc-preview {
    display: none;
    position: absolute;
    left: 0;
    bottom: 20px;
    height: max-content;
    width: fit-content;
    max-width: 150px;
    max-height: 200px;
    background-color: white !important;
    border-radius: 5px;
    padding: 0 8px;
    border: 1px solid black;
    z-index: 1;
  }

  .rc-track:hover .rc-preview {
    display: block;
  }

  .rc-slider .rc-preview:after {
    position: absolute;
    left: calc(50% - 10px);
  }

  .rc-slider .rc-preview-content {
    border-radius: 50%;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    color: black;
    font-weight: 600;
  }

  .rc-track:hover .rc-preview {
    display: inline-block;
  }

  .rc-slider .rc-thumb:hover + .rc-preview {
    display: none;
  }

  .rc-slider .rc-preview-content:after {
    content: " ";
    position: absolute;
    bottom: -5.5px;
    left: calc(50% - 7.5px);
    background-color: whitesmoke;
    height: 10px;
    width: 10px;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    transform: rotateZ(45deg);
  }
  @media (pointer: none), (pointer: coarse) and (max-width: 640px) {
    .rc-slider {
      padding: 0 10px;
    }
  }
</style>
