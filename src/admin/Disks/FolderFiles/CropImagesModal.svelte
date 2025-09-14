<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Input from "src/admin/Component/Input.svelte";

  export let acept;
  export let hide;
  export let files;

  const temp = { image: 1, top: 0, left: 0, width: -1, height: -1 };

  const confirm = () => {
    hide();
    acept({ files, ...temp });
  };
</script>

<Dialog id="crop-modal" cancel={hide} {confirm} canDrag={true}>
  <h4 slot="modal-header">Crop Image In Selected Zip</h4>
  <div class="dir-list" slot="modal-body">
    <Input label="Img #" key="image" type="number" item={temp} paste={false} />
    <Input key="top" item={temp} type="number" paste={false} />
    <Input key="left" item={temp} type="number" paste={false} />
    <Input key="width" item={temp} type="number" paste={false} />
    <Input key="height" item={temp} type="number" paste={false} />
  </div>
</Dialog>

<style>
  .dir-list :global(.input-label) {
    width: 80px;
    white-space: nowrap;
  }
  .dir-list :global(.input) {
    text-align: center;
  }
</style>
