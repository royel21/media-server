<script>
  import { onMount } from "svelte";
  import { loadObject, saveObject } from "src/admin/Utils";

  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import Input from "src/admin/Component/Input.svelte";
  import Language from "./Language.svelte";
  import apiUtils from "src/apiUtils";

  export let socket;
  export let bgWorking;
  export let selectedList = [];
  export let showConvertVideo;

  let defaults = {
    Anime: {
      videoBitrate: 832,
    },
    Film: {
      videoBitrate: 800,
    },
  };

  const hide = () => (showConvertVideo = false);

  const convertVideos = (options) => {
    socket.emit("bg-work", { action: "convertVideo", data: { files: selectedList, ...options } });
    showConvertVideo = false;
    bgWorking = true;
  };

  const commons = {
    audioBitrate: 128,
    Subtitles: "eng|spa",
    Audio: "jap|spa|es|eng",
    Width: 852,
    Height: 478,
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

  const onConfirm = () => convertVideos(item);

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

<Dialog id="v-convert" cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
  <h4 slot="modal-header">Video Transcoder Options</h4>
  <span slot="modal-body">
    <Input label="Video Bitrate" key="videoBitrate" bind:item paste={false} />
    <Input label="Video Bitrate" key="audioBitrate" bind:item paste={false} />
    <Language label="Preferred Subt" key="Subtitles" bind:item {subtitleCodes} />
    <Language label="Preferred Audio" key="Audio" bind:item {subtitleCodes} height={185} />
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

<style>
  :global(#v-convert) {
    min-width: 390px;
    max-width: 390px;
    margin-bottom: 100px;
  }
  :global(#v-convert .input-label) {
    min-width: 130px;
    text-align: right;
    padding-right: 5px;
  }
  :global(#v-convert .Height) {
    max-width: 170px;
  }
  :global(#v-convert .Height .input-label) {
    min-width: 65px;
    max-width: 65px;
  }
  button {
    height: 30px;
    width: 140px;
  }
  @media screen and (max-width: 600px) {
    :global(#v-convert .modal-container) {
      padding-top: 0;
    }

    :global(#v-convert .modal-container .modal) {
      min-width: initial;
    }
  }
</style>
