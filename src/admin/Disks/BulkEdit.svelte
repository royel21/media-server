<script>
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Input from "../Component/Input.svelte";

  export let hide;
  export let files;
  export let acept;

  let item = { Regex: "", Replace: "", With: "", ZeroPad: 2 };
  let errors = [];

  const onConfirm = () => acept(item);

  const onKeydown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Edit Name for: <span>{files.length}</span> {files.length > 1 ? "Files" : "File"}</h4>
  <div class="dir-list" slot="modal-body">
    <div class="input-control-group">
      <Input key="Replace" {item} on:keydown={onKeydown} />
      <Input key="With" {item} on:keydown={onKeydown} />
    </div>
    <Input label="Zero Pad" key="ZeroPad" type="number" min="0" {item} on:keydown={onKeydown} />
    <TextAreaInput focus={true} label="Regex" key="Regex" {item} />
  </div>
</Dialog>

<style>
  .dir-list :global(.input-label) {
    width: 100px;
  }
  h4 span {
    color: firebrick;
  }
  .input-control-group {
    display: flex;
    flex-direction: row;
  }
  .input-control-group :global(.input-control) {
    width: initial;
  }
  .input-control-group :global(.input-control:first-child) {
    margin-right: 5px;
  }
  .input-control-group :global(.input-label) {
    min-width: 81px;
  }
</style>
