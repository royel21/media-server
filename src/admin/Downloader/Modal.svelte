<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "src/admin/Component/Input.svelte";
  import Select from "src/admin/Component/Select.svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";

  export let server = "";
  export let link = "";
  export let error = "";
  export let hide;
  let ref;

  const submit = async (e) => {
    const body = server ? server : link;
    body.table = server ? "Server" : "Link";
    const result = await apiUtils.post("admin/downloader/item-update", body);
    error = result.error;
    if (result.valid) hide();
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      submit(e);
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.keyCode === 27) hide();
  };

  onMount(() => {
    ref?.focus();
  });
</script>

<div bind:this={ref} class="modal-container" class:server on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>{server ? "Edit Server Config" : "Edit Link"}</h4>
    </div>
    <form action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        {#if link}
          <TextAreaInput key="Name" file={link} />
          <TextAreaInput key="Url" file={link} />
          <TextAreaInput key="AltName" file={link} />
          <CheckBox label="Is Adult" key="IsAdult" item={link} />
          <CheckBox label="Is Raw" key="Raw" item={link} />
        {:else}
          <Select key="Type" options={[{ Id: "Manga" }, { Id: "Adult" }]} item={server} />
          <Input key="Title" item={server} />
          <Input key="AltTitle" item={server} />
          <Input key="Chapters" item={server} />
          <Input key="Imgs" item={server} />
          <Input key="Cover" item={server} />
          <Input key="Desc" item={server} />
          <Input key="Genres" item={server} />
          <Input label="Home Query" key="HomeQuery" item={server} />
          <Input key="Status" item={server} />
          <CheckBox label="Raw" key="Raw" item={server} />
          <CheckBox label="Local Images" key="LocalImages" item={server} />
          <CheckBox label="Is Mobile" key="isMobile" item={server} />
        {/if}
      </div>
      <div class="error">{error || ""}</div>
      <div class="modal-footer">
        <button type="button" class="btn" on:click={hide}>Cancel</button>
        <button type="submit" class="btn">Update</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 540px;
    outline: none;
  }
  .modal-container :global(.input-control) {
    margin-bottom: 5px;
  }
  .modal-container :global(.input-label) {
    padding-left: 0.35rem;
    text-align: left;
    width: 145px;
  }
  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }

  @media screen and (max-height: 600px) {
    .server {
      overflow: auto;
      padding-top: 95px;
    }
  }
</style>
