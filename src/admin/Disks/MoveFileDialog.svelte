<script>
  import Input from "../Component/Input.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Dialog from "./Dialog.svelte";
  export let hide;
  export let files;
  export let acept;
  let item = { Path: "", overwrite: false };
  let errors = [];

  const onConfirm = () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/^(\/|[d-z]\:\\)/i.test(item.Path)) {
      return errors.push("Path must be a valid Path");
    }

    if (!/(\\|\/)$/.test(item.Path)) {
      return errors.push('Path must end with "\\" or "/"');
    }

    if (!/^\/(mnt|media)\/.*\/|^[d-z]\:\\|\/home\/.*\/|^c:\\Users\\.*\\/i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }

    return acept(item);
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Move {files.length > 1 ? "Files" : "File"} to Path</h4>
  <span class="dir-list" slot="modal-body">
    <Input label="Path" key="Path" {item} />
    <CheckBox key="Override" {item} />
  </span>
</Dialog>

<style>
  .dir-list :global(.input-label) {
    width: 100px;
  }
</style>
