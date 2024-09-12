<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";

  export let hide;
  export let servers = [];

  let link = { Name: "", AltName: "", Url: "", Raw: false };
  let error = "";
  let ref;

  const submit = async () => {
    if (!link.Url) return (error = "Url Can't be Empty");
    if (!/^http/.test(link.Url)) return (error = "Not a valid Url");

    const result = await apiUtils.post("admin/downloader/add-link", link);
    error = result.error;
    if (result.valid) hide(result);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      submit(e);
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.keyCode === 27) hide();
  };

  const handle = ({ target: { name } }) => {
    if (name === "Url") {
      if (!link.IsAdult && servers) {
        const linkParts = link.Url.split("/");
        let serv = linkParts[2].replace(/www\.|\.html/i, "");
        for (const id in servers) {
          if (servers[id].Name === serv) {
            link.IsAdult = servers[id].Type === "Adult";
            break;
          }
        }
      }
    }
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
        <TextAreaInput key="Name" file={link} onChange={handle} />
        <TextAreaInput key="Url" file={link} onChange={handle} />
        <TextAreaInput key="AltName" sept="; " file={link} onChange={handle} />
        <CheckBox label="Is Adult" key="IsAdult" item={link} />
        <CheckBox label="Is Raw" key="Raw" item={link} />
      </div>
      <div class="error">{error || ""}</div>
      <div class="modal-footer">
        <button type="submit" class="btn">Create</button>
        <button type="button" class="btn" on:click={hide}>Cancel</button>
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
      width: 390px;
    }
  }
</style>
