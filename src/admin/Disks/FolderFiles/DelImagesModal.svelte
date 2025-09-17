<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";

  export let acept;
  export let hide;
  export let files;

  let item = { removeList: "", files: files.map((f) => ({ ...f })) };
  const confirm = () => {
    hide();
    acept(item);
  };
  const onKeydown = (e) => {
    if (e.keyCode === 13) {
      confirm();
      e.preventDefault();
    }
  };
  const style = "text-align: center;";
</script>

<Dialog cancel={hide} {confirm} canDrag={true}>
  <h4 slot="modal-header">Delete Images From Selected Zips</h4>
  <div class="dir-list" slot="modal-body" on:keydown={onKeydown}>
    <TextAreaInput label="Remove List For All Files" key="removeList" {item} rows={1} paste={false} {style} />
    <h4>Remove Per File</h4>
    <div class="del-file-list">
      <ul class="list">
        {#each item.files as file}
          <li class="list-item">
            <TextAreaInput label={file.Name} key="removeList" {file} rows={1} paste={false} />
          </li>
        {/each}
      </ul>
    </div>
  </div>
</Dialog>

<style>
  .del-file-list {
    height: 300px;
    overflow-y: auto;
  }
  .list-item {
    margin-bottom: 5px;
  }
  .dir-list :global(.input-control) {
    margin-bottom: 0;
  }
  .dir-list :global(.input-label) {
    width: 135px;
  }
</style>
