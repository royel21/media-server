<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../Component/Dialog.svelte";
  export let hide;
  export let acept;
  export let data = "";
  let item = { pass: "", text: "", padding: 2 };

  const onConfirm = () => {
    return acept({ folder: data, ...item });
  };
</script>

<Dialog cancel={hide} confirm={onConfirm}>
  <h4 slot="modal-header">Password if needed or left empty</h4>
  <span class="dir-list" slot="modal-body">
    <Input label="Text To Remove" key="text" {item} placeholder="Text to remove from names" />
    <Input label="Files Password" key="pass" {item} placeholder="password Needed to extract files" />
    <Input label="0 Padding" key="padding" {item} />
  </span>
</Dialog>

<style>
  .dir-list :global(.input-label) {
    width: 200px;
    padding-right: 5px;
    text-align: right;
  }
</style>
