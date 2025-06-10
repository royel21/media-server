<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import { loadObject, saveObject } from "../Utils";
  import apiUtils from "src/apiUtils";
  import { onMount } from "svelte";

  export let hide;
  export let acept;

  let defaults = {
    Anime: { videoBitrate: 832, audioBitrate: 128, Width: 1280, Height: -1, Subtitles: "eng|spa", Debug: false },
    Film: { videoBitrate: 1088, audioBitrate: 128, Width: 1280, Height: -1, Subtitles: "eng|spa", Debug: false },
    Default: "Anime",
  };

  const options = [{ Id: "Anime" }, { Id: "Film" }];
  const KEY = "VideoConvertConfig";
  let subtitleCodes = [];
  let showSubtCodeList = false;

  let errors = [];

  let item = loadObject(KEY) || { ...defaults.Anime, Remove: false, Default: "Anime" };

  const loadDef = () => {
    item = { ...item, ...defaults[item.Default] };
  };

  const onConfirm = () => acept(item);

  const toggleSubtCodeList = () => (showSubtCodeList = !showSubtCodeList);

  onMount(async () => {
    const result = await apiUtils.getStatic("/subtitle-codes.json");
    if (!result.error) {
      subtitleCodes = result;
    }
  });

  $: {
    saveObject(KEY, item);
  }
</script>

<div id="v-convert">
  <Dialog cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
    <h4 slot="modal-header">Video Transcoder Options</h4>
    <span slot="modal-body">
      <Input label="Video Bitrate" key="videoBitrate" bind:item paste={false} />
      <Input label="Video Bitrate" key="audioBitrate" bind:item paste={false} />
      <div class="subt" on:click={toggleSubtCodeList}>
        <div class="subt-list" class:show-subt-code-list={showSubtCodeList}>
          <div class="sub-row-1">Write Code Separate By |</div>
          {#each subtitleCodes as sub}
            <div class="sub-row">
              <span>{sub.code}</span>
              <span>{sub.description}</span>
            </div>
          {/each}
        </div>
        <Input label="Preferred Sub" key="Subtitles" bind:item paste={false} />
      </div>
      <div class="input-control-group">
        <Input label="Max Width" key="Width" bind:item paste={false} />
        <Input key="Height" bind:item paste={false} />
      </div>
      <CheckBox key="Debug" bind:item />
      <CheckBox label="Remove Files" key="Remove" bind:item />
      <div class="input-control-group anin-def">
        <Select {item} label="Default CFG" key="Default" {options} />
        <button type="button" class="btn" on:click={loadDef}>Load Default</button>
      </div>
    </span>
  </Dialog>
</div>

<style>
  #v-convert :global(.modal-container) {
    padding-top: 0;
  }
  #v-convert :global(.modal-container .modal) {
    min-width: 390px;
    max-width: 390px;
  }
  #v-convert :global(.input-label) {
    min-width: 115px;
    max-width: 115px;
    text-align: right;
    padding-right: 5px;
  }
  #v-convert :global(.Height) {
    max-width: 170px;
  }
  #v-convert :global(.Height .input-label) {
    min-width: 65px;
    max-width: 65px;
  }
  button {
    height: 30px;
    width: 140px;
  }
  .subt {
    position: relative;
  }
  .subt-list {
    display: none;
    position: absolute;
    top: 30px;
    background-color: black;
    z-index: 99;
    border-radius: 0.25rem;
    height: 220px;
    overflow-y: auto;
  }
  .sub-row-1 {
    position: sticky;
    top: 0;
    background-color: black;
  }

  .show-subt-code-list {
    display: block;
  }
  .sub-row {
    display: flex;
    justify-content: space-between;
    padding: 0 5px;
  }
  .sub-row span {
    display: inline-block;
    width: 35%;
    text-align: left;
    font-size: 0.9rem;
  }
  .sub-row span:last-child {
    width: 65%;
  }
  @media screen and (max-width: 600px) {
    #v-convert :global(.modal-container) {
      padding-top: 0;
    }
    #v-convert :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
