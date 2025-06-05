<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";

  export let hide;
  export let acept;

  let defaults = {
    Start: "00:00:00",
    End: "00:00:00",
  };

  let errors = [];

  let item = { ...defaults.Anime, Remove: false, Default: "Anime" };

  const onConfirm = () => {
    return acept(item);
  };

  const onChange = () => (item = { ...item, ...defaults[item.Default] });
</script>

<div id="v-convert">
  <Dialog cancel={hide} confirm={onConfirm} {errors}>
    <h4 slot="modal-header">Extract Sub Video Options</h4>
    <span slot="modal-body">
      <Input key="Start" {item} />
      <Input key="End" {item} />
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

  @media screen and (max-width: 600px) {
    #v-convert :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
