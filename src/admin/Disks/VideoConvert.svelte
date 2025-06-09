<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";

  export let hide;
  export let acept;

  let defaults = {
    Anime: { videoBitrate: 832, audioBitrate: 128, Width: 1280, Height: -1, Debug: false },
    Film: { videoBitrate: 1088, audioBitrate: 128, Width: 1280, Height: -1, Debug: false },
  };

  const options = [{ Id: "Anime" }, { Id: "Film" }];

  let errors = [];

  let item = { ...defaults.Anime, Remove: false, Default: "Anime" };

  const onConfirm = () => {
    return acept(item);
  };

  const onChange = () => (item = { ...item, ...defaults[item.Default] });
</script>

<div id="v-convert">
  <Dialog cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
    <h4 slot="modal-header">Video Convert Options</h4>
    <span slot="modal-body">
      <Input label="Video Bitrate" key="videoBitrate" {item} paste={false} />
      <Input label="Video Bitrate" key="audioBitrate" {item} paste={false} />
      <div class="input-control-group">
        <Input label="Max Width" key="Width" {item} paste={false} />
        <Input label="Max Height" key="Height" {item} paste={false} />
      </div>
      <CheckBox key="Debug" {item} />
      <CheckBox label="Remove Files" key="Remove" {item} />
      <div class="input-control-group anin-def">
        <Select {item} label="Default" key="Default" {options} {onChange} />
      </div>
    </span>
  </Dialog>
</div>

<style>
  #v-convert :global(.modal-container .modal) {
    min-width: 390px;
    max-width: 390px;
  }
  #v-convert :global(.input-label:not(#t-label)) {
    min-width: 110px;
    max-width: 110px;
    text-align: right;
    padding-right: 5px;
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
