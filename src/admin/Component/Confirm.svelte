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
  <h4 slot="modal-header">Confirm</h4>
  <span slot="modal-body"><p>Are you Sure want to <strong>{text}</strong></p></span>
</Dialog>

<style>
  strong {
    color: rgb(255, 166, 0);
  }
  p {
    text-align: center;
  }
</style>
