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
  let removeTags = [];
  let data = { Id: item.Id, [title]: item[title] };

  const validate = () => {
    if (!data[title]) return;

    if (title === "Genres") {
      data.Genres = validGenres(data.Genres, tags, removeTags);
    }

    if (title === "AltName") {
      data.AltName = validAltName(data.AltName);
    }

    if (title === "Author") {
      data.Author = validateAuthor(data.Author);
    }
  };

  const addGengres = ({ target }) => {
    const genres = target.id;
    data.Genres = `${data.Genres.replace(/Manga|Manhwa|Webtoon/g, "")}, ${genres}`;
    validate();
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
      update({ ...item, ...data });
      return hide();
    }

    errors = result.errors;
  };

  onMount(async () => {
    const result = await apiUtils.get(["files", "folder", "tags"]);
    if (result.error) {
      tags = result.filter((g) => !g.IsRemove).map((g) => g.Name);
      removeTags = result.filter((g) => g.IsRemove).map((g) => g.Name);
    }
  });
</script>

<Dialog cancel={hide} confirm={onSave} {errors}>
  <h4 slot="modal-header">
    Edit {title}
    {#if title === "Genres"}
      <span class="grn">
        <span id="Manga" class="badge" on:click={addGengres}>MAN</span>
        <span id="Manhwa" class="badge" on:click={addGengres}>MHW</span>
        <span id="Webtoon" class="badge" on:click={addGengres}>WBT</span></span
      >
    {/if}
  </h4>
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
  .grn {
    position: absolute;
    top: -1px;
    right: 5px;
  }
  .grn span {
    padding: 2px 4px;
    font-size: 14px;
  }

  .pre-paste {
    position: absolute;
    left: 5px;
  }
</style>
