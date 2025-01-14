<script>
  import Dialog from "../../ShareComponent/Dialog.svelte";
  export let text = "";
  export let cancel;
  export let acept;
  export let data = "";

  const onConfirm = () => {
    acept(data);
    cancel();
  };
</script>

<Dialog {cancel} confirm={onConfirm}>
  <h4 slot="modal-header">Remove Confirm</h4>
  <span slot="modal-body"><p>Are you Sure want to remove <strong>{text}</strong></p></span>
</Dialog>

<style>
  strong {
    color: red;
  }
</style>
