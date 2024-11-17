<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "../Component/Dialog.svelte";
  export let hide;
  export let acept;
  let item = { Name: "" };
  let errors = [];

  const onConfirm = () => {
    errors = [];
    if (!item.Name) {
      return errors.push("Path can't be empty");
    }

    return acept(item);
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Create Folder</h4>
  <span slot="modal-body"><Input label="Name" key="Name" {item} /></span>
</Dialog>
