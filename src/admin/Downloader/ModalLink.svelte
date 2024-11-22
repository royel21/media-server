<script>
  import { onMount } from "svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";
  import Dialog from "../Component/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let hide;
  export let servers = [];

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

  const handle = ({ target: { name } }) => {
    if (name === "Url") {
      if (!link.IsAdult && servers) {
        const linkParts = link.Url.split("/");
        if (linkParts.length > 1) {
          let serv = linkParts[2].replace(/www\.|\.html/i, "");
          for (const id in servers) {
            if (servers[id].Name === serv) {
              link.IsAdult = servers[id].Type === "Adult";
              break;
            }
          }
        }
      }
    }
  };

  const joinPaste = async () => {
    let text = await navigator.clipboard?.readText();
    if (link.Url) {
      link.Url += "\n" + text;
    } else {
      link.Url = text;
    }
  };

  onMount(() => {
    ref?.focus();
  });
</script>

<Dialog cancel={hide} confirm={submit} {errors}>
  <h4 slot="modal-header">New Link</h4>
  <svelte:fragment slot="modal-body">
    <TextAreaInput key="Name" file={link} onChange={handle} />
    <TextAreaInput key="Url" file={link} onChange={handle}>
      <span class="pre-paste" slot="btn-left" on:click={joinPaste} title="Paste To The Right">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
    <TextAreaInput key="AltName" sept="; " file={link} onChange={handle} />
    <CheckBox label="Is Adult" key="IsAdult" item={link} />
    <CheckBox label="Is Raw" key="Raw" item={link} />
  </svelte:fragment>
</Dialog>
