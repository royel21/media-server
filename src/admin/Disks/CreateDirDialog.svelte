<script>
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  export let hide;
  export let acept;
  let item = { Name: "" };
  let errors = [];

  const onConfirm = () => {
    errors = [];
    if (!item.Name) {
      return errors.push("Folder Name must no be empty");
    }

    if (/:|\?|\*|<|>|\/|\\"/gi.test(item.Name)) {
      errors.push("File Name should't not have any of those Simbols");
      return errors.push(':  ?  * < >  / \\ " |');
    }

    return;

    return acept(item);
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Create Folder</h4>
  <svelte:fragment slot="modal-body">
    <TextAreaInput key="Name" {item} />
  </svelte:fragment>
</Dialog>
