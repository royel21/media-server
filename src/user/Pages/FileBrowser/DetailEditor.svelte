<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  import { validAltName, validateAuthor, validGenres } from "src/ShareComponent/utils";
  import { onMount } from "svelte";
  export let hide;
  export let item;
  export let title;
  export let update;
  let errors = [];
  let tags = [];
  let data = { Id: item.Id, [title]: item[title] };

  const validate = () => {
    if (!data[title]) return;

    if (title === "Genres") {
      data.Genres = validGenres(data.Genres, tags);
    }

    if (title === "AltName") {
      data.AltName = validAltName(data.AltName);
    }

    if (title === "Author") {
      data.Author = validateAuthor(data.Author);
    }
  };

  const prePaste = async () => {
    let text = await navigator.clipboard?.readText();

    if (!text || data[title]?.includes(text)) return;

    if (title === "Genres") {
      data.Genres = data.Genres ? data.Genres + ", " + text : text;
    }

    if (title === "AltName") {
      data.AltName = data.AltName ? text + " ;" + data.AltName : text;
    }

    if (title === "Author") {
      data.Author = data.Author ? data.Author + ", " + text : text;
    }
    validate(data);
  };

  const onSave = async () => {
    const result = await apiUtils.post("files/folder/update", data);
    if (result.valid) {
      console.log(data);
      update({ ...item, ...data });
      return hide();
    }

    errors = result.errors;
  };

  onMount(async () => {
    tags = await apiUtils.get(["files", "folder", "tags"]);
    console.log(tags);
  });
</script>

<Dialog cancel={hide} confirm={onSave} {errors}>
  <h4 slot="modal-header">Edit {title}</h4>
  <span slot="modal-body">
    <TextAreaInput
      key={title}
      item={data}
      focus={true}
      rows={7}
      sept={title === "AltName" ? "; " : ", "}
      onChange={validate}
    >
      <span class="pre-paste" slot="btn-left" on:click={prePaste} title="Paste To The Left">
        <Icons name="paste" color="black" />
      </span>
    </TextAreaInput>
  </span>
</Dialog>

<style>
  .pre-paste {
    position: absolute;
    left: 5px;
  }
</style>
