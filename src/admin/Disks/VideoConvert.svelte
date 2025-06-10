<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import { loadObject, saveObject } from "../Utils";
  import apiUtils from "src/apiUtils";
  import { onMount } from "svelte";
  import Language from "./Language.svelte";

  export let hide;
  export let acept;

  let defaults = {
    Anime: {
      videoBitrate: 832,
    },
    Film: {
      videoBitrate: 1088,
    },
  };

  const commons = {
    audioBitrate: 128,
    Subtitles: "eng|spa",
    Audio: "jap|spa|es|eng",
    Width: 1280,
    Height: -1,
    Remove: false,
    Debug: false,
  };

  const options = [{ Id: "Anime" }, { Id: "Film" }];
  const KEY = "VideoConvertConfig";
  let subtitleCodes = [];

  let errors = [];

  const config = {
    ...commons,
    ...defaults.Anime,
    Default: "Anime",
  };

  let item = loadObject(KEY) || config;

  const loadDef = () => {
    item = { ...item, ...commons, ...defaults[item.Default] };
  };

  const onConfirm = () => acept(item);

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
  <Dialog cancel={hide} confirm={onConfirm} {errors}>
    <h4 slot="modal-header">Video Transcoder Options</h4>
    <span slot="modal-body">
      <Input label="Video Bitrate" key="videoBitrate" bind:item paste={false} />
      <Input label="Video Bitrate" key="audioBitrate" bind:item paste={false} />
      <Language label="Preferred Subt" key="Subtitles" bind:item {subtitleCodes} />
      <Language label="Preferred Audio" key="Audio" bind:item {subtitleCodes} height={188} />
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
    min-width: 130px;
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
  @media screen and (max-width: 600px) {
    #v-convert :global(.modal-container) {
      padding-top: 0;
    }
    #v-convert :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
