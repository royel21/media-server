<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  import { FilesStore, TextRex } from "../Store/FilesStore";
  import CCheckbox from "./CCheckbox.svelte";
  let errors = [];
  let item = {};
  let ref;
  let textwrap = localStorage.getItem("edit-wrap");

  FilesStore.subscribe(async ({ file }) => {
    if (file.Path || TextRex.test(file.Path)) {
      const result = await apiUtils.admin(["files", "text-file", encodeURIComponent(file.Path)], "text-edit");
      if (result.error) {
        return (errors = [result.error]);
      }
      // errors = [];
      item = { ...file, Text: result.Text };
    }
  });

  const onCheck = () => {
    textwrap = !textwrap;

    console.log(textwrap);
  };

  const hide = () => {
    FilesStore.set({ file: {} });
    item = {};
  };

  const save = async () => {
    const result = await apiUtils.post("admin/files/save-text", { ...item });
    if (result.error) {
      return (errors = [result.error]);
    }

    hide();
  };

  const paste = async () => {
    ref.focus();
    document.execCommand("paste");
  };
  $: localStorage.setItem("edit-wrap", textwrap);
</script>

{#if item.Text !== undefined}
  <Dialog id="text-edit" confirm={save} {errors} canDrag={true} background={false}>
    <h4 slot="modal-header">Text Editor</h4>
    <svelte:fragment slot="modal-body">
      <TextAreaInput bind:ref focus={true} key="Text" {item} paste={false} {textwrap}>
        <span class="pre-paste" slot="btn-left" on:click={paste} title="Paste">
          <Icons name="paste" color="#045cba" />
        </span>
      </TextAreaInput>
    </svelte:fragment>
    <div class="footer" slot="modal-footer">
      <label class="text-wrap" for="check" on:click={onCheck}>
        <CCheckbox isChecked={textwrap} /> Text Wrap
      </label>
      <button class="btn" type="">Save</button>
      <button class="btn" type="button" on:click={hide}>Cancel</button>
    </div>
  </Dialog>
{/if}

<style>
  :global(#text-edit) {
    height: initial;
    width: 560px;
    max-width: 99%;
  }
  :global(#text-edit .form) {
    display: flex;
    flex-direction: row;
  }
  :global(#text-edit .modal-body) {
    height: 300px;
    padding: 4px;
  }
  :global(#text-edit .input-control) {
    height: 92%;
  }
  :global(#text-edit textarea) {
    height: 100%;
    resize: none;
  }
  .pre-paste {
    position: absolute;
    left: 5px;
  }
  .text-wrap {
    position: absolute;
    left: 5px;
    bottom: 5px;
    cursor: pointer;
  }

  .text-wrap > :global(label) {
    right: 10px;
  }
  .footer {
    position: relative;
    text-align: center;
    border-top: 1px solid;
    padding: 5px 0;
  }
  .footer .btn {
    margin: 0 5px;
  }
</style>
