<script>
  import TextAreaInput from "../../../ShareComponent/TextAreaInput.svelte";
  import Dialog from "../../../ShareComponent/Dialog.svelte";
  export let hide;
  export let acept;
  export let file = "";
  export let title = "File";
  export let errors = [];
  let item = { ...file };
  let extension;

  const onConfirm = () => {
    errors = [];
    let Name = item.Name + (extension ? extension : "");
    if (file.Name === Name) {
      return hide();
    }

    if (/:|\?|\*|<|>|\/|\\"/gi.test(Name)) {
      errors.push("File Name should't not have any of those Simbols");
      return errors.push(':  ?  * < >  / \\ " |');
    }
    acept({ ...item, Name, Path: item.Path.replace(file.Name, Name) });
    hide();
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
  <span id="f-rename" slot="modal-body"><TextAreaInput label="New Name" key="Name" {item} focus={true} /></span>
</Dialog>

<style>
  #f-rename :global(.input-control .input:focus) {
    padding-right: 35px;
  }
</style>
