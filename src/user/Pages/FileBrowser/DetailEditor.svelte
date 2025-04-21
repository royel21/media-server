<script>
  import apiUtils from "src/apiUtils";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  export let hide;
  export let item;
  export let title;
  export let update;
  let errors = [];
  const onSave = async () => {
    const result = await apiUtils.post("files/folder/update", { Id: item.Id, [title]: item[title] });
    if (result.valid) {
      update(item);
      return hide();
    }

    errors = result.errors;
  };
</script>

<Dialog cancel={hide} confirm={onSave} {errors}>
  <h4 slot="modal-header">Edit {title}</h4>
  <span slot="modal-body">
    <TextAreaInput key={title} {item} focus={true} rows={7} />
  </span>
</Dialog>
