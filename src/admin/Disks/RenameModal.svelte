<script>
  import Input from "../Component/Input.svelte";
  import Dialog from "./Dialog.svelte";
  export let hide;
  export let acept;
  export let data = "";
  export let title = "Folder";
  let item = { ...data };
  let errors = [];
  let extension;

  const onConfirm = () => {
    errors = [];
    if (data.Name === item.Name) {
      return errors.push("Name Equal");
    }

    if (/:|\?|\*|<|>|\/|\\"/gi.test(item.Name)) {
      errors.push("Folder Name should't not have any of those Simbols");
      return errors.push(':  ?  * < >  / \\ " |');
    }
    let Name = item.Name + (extension ? extension : "");
    acept({ folder: data, Name });
    return hide();
  };

  if (item.Name) {
    const parts = item.Name.match(/\.(mp4|mkv|avi|ogg|zip)/i);
    if (parts) {
      extension = parts[0];
      item.Name = item.Name.replace(extension, "");
    }
  }
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Rename {title}</h4>
  <span id="f-rename" slot="modal-body"><Input label="New Name" key="Name" {item} focus={true} /></span>
</Dialog>

<style>
  #f-rename :global(.input-control .input:focus) {
    padding-right: 35px;
  }
</style>
