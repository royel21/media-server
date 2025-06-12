<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  import { FilesStore, TextRex } from "../Store/FilesStore";
  let errors = [];
  let item = {};
  let ref;

  FilesStore.subscribe(async ({ file }) => {
    if (TextRex.test(file.Name)) {
      const result = await apiUtils.admin(["files", "text-file", encodeURIComponent(file.Path)], "text-edit");
      if (result.error) {
        return (errors = [result.error]);
      }

      item = { ...file, Text: result.Text };
    }
  });
  const hide = () => {
    FilesStore.set({ file: {} });
    item = {};
  };

  const save = async () => {
    const result = await apiUtils.post("/admin/files/save-text", { ...item });
    if (result.error) {
      return (errors = [result.error]);
    }

    hide();
  };

  const paste = async () => {
    ref.focus();
    document.execCommand("paste");
  };
</script>

{#if item.Text !== undefined}
  <Dialog id="text-edit" cancel={hide} confirm={save} {errors} canDrag={true} btnOk="Save" background={false}>
    <h4 slot="modal-header">Text Editor</h4>
    <div slot="modal-body">
      <TextAreaInput bind:ref focus={true} key="Text" rows={15} {item} paste={false}>
        <span class="pre-paste" slot="btn-left" on:click={paste} title="Copy Name">
          <Icons name="paste" color="#045cba" />
        </span>
      </TextAreaInput>
    </div>
  </Dialog>
{/if}

<style>
  :global(#text-edit .modal-body) {
    padding: 4px 4px 0px 4px;
  }
  .pre-paste {
    position: absolute;
    left: 5px;
  }
</style>
