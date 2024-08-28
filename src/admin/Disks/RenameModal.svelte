<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "./Dialog.svelte";
  export let hide;
  export let acept;
  export let data = "";
  export let title = "Folder";
  let item = { ...data };
  let errors = [];

  const onConfirm = () => {
    errors = [];
    if (data.Name === item.Name) {
      return errors.push("Name Equal");
    }

    if (/:|\?|\*|<|>|\/|\\"/gi.test(item.Name)) {
      errors.push("Folder Name should't not have any of those Simbols");
      return errors.push(':  ?  * < >  / \\ " |');
    }
    acept({ folder: data, Name: item.Name });
    return hide();
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Rename {title}</h4>
  <span slot="modal-body"><Input label="New Name" key="Name" {item} focus={true} /></span>
</Dialog>
