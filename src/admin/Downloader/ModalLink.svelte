<script>
  import { onMount } from "svelte";
  import CheckBox from "src/admin/Component/CheckBox.svelte";
  import TextAreaInput from "src/admin/Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";
  import Dialog from "../Component/Dialog.svelte";

  export let hide;
  export let servers = [];

  let link = { Name: "", AltName: "", Url: "", Raw: false };
  let errors = [];
  let ref;

  const submit = async () => {
    if (!link.Url) return (errors = ["Url Can't be Empty"]);
    if (!/^http/.test(link.Url)) return (errors = ["Not a valid Url"]);

    const result = await apiUtils.post("admin/downloader/add-link", link);
    if (errors) {
      errors = [result.error];
    }
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

<Dialog cancel={hide} confirm={submit} {errors}>
  <h4 slot="modal-header">New Link</h4>
  <svelte:fragment slot="modal-body">
    <TextAreaInput key="Name" file={link} onChange={handle} />
    <TextAreaInput key="Url" file={link} onChange={handle} />
    <TextAreaInput key="AltName" sept="; " file={link} onChange={handle} />
    <CheckBox label="Is Adult" key="IsAdult" item={link} />
    <CheckBox label="Is Raw" key="Raw" item={link} />
  </svelte:fragment>
</Dialog>
