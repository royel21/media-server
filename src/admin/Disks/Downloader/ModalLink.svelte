<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";

  export let hide;
  let link = { Name: "", AltName: "", IsAdult: false, Url: "" };
  let error = "";
  let ref;

  const submit = async (e) => {
    if (!link.Url) return (error = "Url Can't be Empty");
    if (!/^http/.test(link.Url)) return (error = "Not a valid Url");

    const result = await apiUtils.post("admin/downloader/add-link", link);
    error = result.error;
    if (result.valid) hide(true);
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

<div bind:this={ref} class="modal-container" on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>New Link</h4>
    </div>
    <form action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        <TextAreaInput key="Name" file={link} />
        <TextAreaInput key="Url" file={link} />
        <TextAreaInput key="AltName" file={link} />
        <CheckBox label="Is Adult" key="IsAdult" item={link} />
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
  .error:empty {
    display: none;
  }
  .error {
    color: red;
    font-weight: 600;
  }
  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }
</style>
