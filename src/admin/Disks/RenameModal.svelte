<script>
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  export let hide;
  export let acept;
  export let data = "";
  export let title = "Folder";
  export let errors = [];
  let item = { ...data };
  let extension;
  let areaRef;

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
  };

  const prePaste = async () => {
    let text = await navigator.clipboard?.readText();
    if (text) {
      item.Name = text + item.Name;
      areaRef.focus();
    }
  };

  const postPaste = async () => {
    let text = await navigator.clipboard?.readText();
    if (text) {
      item.Name = item.Name + text;
      areaRef.focus();
    }
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
  <span id="f-rename" slot="modal-body">
    <TextAreaInput label="New Name" key="Name" {item} focus={true} bind:ref={areaRef}>
      <span class="pre-paste" slot="btn-left" on:click={prePaste} title="Paste To The Left">
        <Icons name="paste" color="black" />
      </span>
      <span class="post-paste" slot="btn-right" on:click={postPaste} title="Paste To The Right">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
  </span>
</Dialog>

<style>
  #f-rename :global(.input-control .input:focus) {
    padding-right: 35px;
  }
  .pre-paste {
    position: absolute;
    left: 5px;
  }
  .post-paste {
    position: absolute;
    right: 5px;
  }
</style>
