<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";

  export let hide;
  export let acept;

  let defaults = {
    Anime: { videoBitrate: 832, audioBitrate: 128 },
    Film: { videoBitrate: 1088, audioBitrate: 128 },
  };

  const options = [{ Id: "Anime" }, { Id: "Film" }];

  let errors = [];

  let item = { ...defaults.Anime, Remove: false, Default: "Anime" };

  const onConfirm = () => {
    return acept(item);
  };

  const loadDefaults = () => {
    console.log(defaults[item.Default]);
    console.log(item.Default);

    item = { ...item, ...defaults[item.Default] };
  };
  //videoBitrate, audioBitrate, remove, debug
</script>

<div id="v-convert">
  <Dialog cancel={hide} confirm={onConfirm} {errors}>
    <h4 slot="modal-header">Video Convert Options</h4>
    <span slot="modal-body">
      <Input label="Video Bit Rate" key="videoBitrate" {item} />
      <Input label="Video Bit Rate" key="audioBitrate" {item} />
      <CheckBox label="Remove Files" key="Remove" {item} />
      <div class="input-control-group anin-def">
        <Select {item} label="Default" key="Default" {options} />
        <button class="btn btn-secondary" on:click={loadDefaults}>Load Defaults</button>
      </div>
    </span>
  </Dialog>
</div>

<style>
  #v-convert :global(.modal-container .modal) {
    min-width: 350px;
    max-width: 350px;
  }
  #v-convert :global(.input-label:not(#t-label)) {
    min-width: 120px;
    max-width: 120px;
    text-align: right;
    padding-right: 5px;
  }
  .input-control-group {
    display: flex;
    flex-direction: row;
  }

  .anin-def .btn {
    margin-left: 5px;
    min-width: 120px;
    height: 30px;
  }

  @media screen and (max-width: 600px) {
    #v-convert :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
