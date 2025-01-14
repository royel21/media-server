<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "src/admin/Component/Input.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";
  import Dialog from "../../ShareComponent/Dialog.svelte";

  export let server = "";
  export let link = "";
  export let errors = "";
  export let hide;

  const submit = async (e) => {
    const body = server ? server : link;
    body.table = server ? "Server" : "Link";
    const result = await apiUtils.post("admin/downloader/item-update", body);
    if (errors) errors = [result.error];
    if (result.valid) hide();
  };

  const onChange = ({ target: { value } }) => {
    server.Type = value;
  };
</script>

<Dialog cancel={hide} confirm={submit} {errors} btnOk="Update" class="server">
  <h4 slot="modal-header">{server ? `Editing ${server.Name} Configurations` : "Edit Link"}</h4>
  <svelte:fragment slot="modal-body">
    {#if link}
      <TextAreaInput key="Name" file={link} />
      <TextAreaInput key="Url" file={link} />
      <TextAreaInput key="AltName" file={link} />
      <CheckBox label="Is Adult" key="IsAdult" item={link} />
      <CheckBox label="Is Raw" key="Raw" item={link} />
    {:else}
      <CheckBox label="Enable" key="Enable" item={server} />
      <Select key="Type" options={[{ Id: "Manga" }, { Id: "Adult" }]} item={server} {onChange} />
      <Input key="Title" item={server} />
      <Input key="AltTitle" item={server} />
      <Input key="Chapters" item={server} />
      <Input key="Imgs" item={server} />
      <Input key="Cover" item={server} />
      <Input key="Desc" item={server} />
      <Input key="Genres" item={server} />
      <Input key="Status" item={server} />
      <Input key="Delay" item={server} />
      <Input label="Home Query" key="HomeQuery" item={server} />
      <CheckBox label="Raw" key="Raw" item={server} />
      <CheckBox label="Local Images" key="LocalImages" item={server} />
      <CheckBox label="Is Mobile" key="isMobile" item={server} />
    {/if}
  </svelte:fragment>
</Dialog>

<style>
  :global(.server) {
    width: 540px;
    outline: none;
  }
  :global(.server .input-control) {
    margin-bottom: 5px;
  }
  :global(.server .input-label) {
    padding-left: 0.35rem;
    text-align: left;
    width: 145px;
  }
  @media screen and (max-width: 450px) {
    :global(.server) {
      width: 390px;
    }
  }

  @media screen and (max-height: 600px) {
    :global(.server) {
      overflow: auto;
    }
  }
</style>
