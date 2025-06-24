<script>
  import { onMount } from "svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let hide;

  let link = { Name: "", AltName: "", Url: "", Raw: false };
  let errors = [];
  let ref;

  const submit = async () => {
    if (!link.Url) return (errors = ["Url Can't be Empty"]);
    if (!/^http/.test(link.Url)) return (errors = ["Not a valid Url"]);

    const result = await apiUtils.post("admin/downloader/add-link", link);
    if (result.error) {
      errors = result.error;
    }
    if (result.valid) hide(result);
  };

  const joinPaste = async () => {
    let text = await navigator.clipboard?.readText();
    if (!link.Url.includes(text) && /http/.test(text)) {
      if (link.Url) {
        link.Url = text + "\n" + link.Url;
      } else {
        link.Url = text;
      }
    }
  };

  onMount(() => {
    ref?.focus();
  });
</script>

<Dialog id="new-link" cancel={hide} confirm={submit} {errors}>
  <h4 slot="modal-header">New Link</h4>
  <svelte:fragment slot="modal-body">
    <TextAreaInput key="Name" file={link} />
    <TextAreaInput key="Url" file={link}>
      <span class="pre-paste" slot="btn-left" on:click={joinPaste} title="Paste To The Right">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
    <TextAreaInput key="AltName" sept="; " file={link} />
    <CheckBox label="Is Adult" key="IsAdult" item={link} />
    <CheckBox label="Is Raw" key="Raw" item={link} />
  </svelte:fragment>
</Dialog>

<style>
  .pre-paste {
    position: absolute;
    left: 5px;
    padding: 0 6px;
  }
  :global(#new-link .check-box .input-label) {
    min-width: 80px;
  }
</style>
