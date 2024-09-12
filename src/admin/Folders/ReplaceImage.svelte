<script>
  import { fade } from "svelte/transition";
  import apiUtils from "src/apiUtils";

  export let Id;
  export let hide;
  let imageData = { Id, url: "" };

  const onPaste = async () => {
    let text = await navigator.clipboard?.readText();
    if (/http/.test(text)) {
      imageData.url = text;
    }
  };

  const submit = async () => {
    if (imageData.url) {
      const data = await apiUtils.post("admin/folders/image", imageData);
      if (data.valid) {
        hide();
      }
    }
  };
</script>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }} tabindex="-1">
    <div class="modal-header">
      <h4>Update Image</h4>
    </div>
    <form action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        <div class="input-group">
          <span class="input-group-text" on:click={onPaste}>Url</span>
          <input class="form-control" bind:value={imageData.url} />
        </div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn"> Update </button>
        <button type="button" class="btn" on:click={hide}>Cancel</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 400px;
    outline: none;
  }
  .modal .form-control {
    margin: 0;
  }

  .input-group-text {
    cursor: pointer;
    width: 45px;
    user-select: none;
  }
  @media screen and (max-width: 450px) {
    .modal {
      width: 390px;
    }
  }
</style>
