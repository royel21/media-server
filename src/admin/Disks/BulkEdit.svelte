<script>
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import TextAreaInput from "../../ShareComponent/TextAreaInput.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Input from "../Component/Input.svelte";

  export let hide;
  export let files;
  export let acept;

  let item = {
    Regex: "",
    Replace: "",
    With: "",
    ZeroPad: 3,
    Case: "None",
  };

  let errors = [];

  const onConfirm = () => acept(item);

  const onKeydown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  $: console.log(item.Case);
</script>

<Dialog class="bulk-edit" cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Edit Name for: <span>{files.length}</span> {files.length > 1 ? "Files" : "File"}</h4>
  <div class="dir-list" slot="modal-body">
    <div class="input-control-group">
      <Input key="Replace" {item} on:keydown={onKeydown} />
      <Input key="With" {item} on:keydown={onKeydown} />
    </div>
    <Input label="Zero Pad" key="ZeroPad" type="number" min="0" {item} on:keydown={onKeydown} />
    <div class="input-control">
      <div id="t-label" class="input-label">Case Type</div>
      <div class="input">
        <label for="None"><input id="None" value="None" type="radio" bind:group={item.Case} /> None</label>
        <label for="Camel"><input id="Camel" value="Camel" type="radio" bind:group={item.Case} /> Camel</label>
        <label for="Upper"><input id="Upper" value="Upper" type="radio" bind:group={item.Case} /> Upper</label>
        <label for="Lower"><input id="Lower" value="Lower" type="radio" bind:group={item.Case} /> Lower</label>
      </div>
    </div>
    <TextAreaInput focus={true} label="Regex" key="Regex" {item} />
  </div>
</Dialog>

<style>
  .dir-list :global(.input-label) {
    min-width: 92px;
  }
  h4 span {
    color: firebrick;
  }
  .input-control-group {
    display: flex;
    flex-direction: row;
  }
  .input-control-group :global(.input-control:first-child) {
    margin-right: 5px;
  }

  .input-control-group :global(div:last-child .input-label) {
    width: 45px;
    min-width: 45px;
  }
  .input-control {
    position: relative;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  #t-label {
    width: 100%;
    text-align: center;
    border-radius: 0;
    border-top-right-radius: 0.25rem;
    border-top-left-radius: 0.25rem;
    user-select: none;
  }
  .input {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: initial;
    font-weight: 700;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0.25rem;
  }
  .input input,
  .input label {
    display: inline-flex;
    cursor: pointer;
  }
  .input input {
    margin-right: 5px;
  }
</style>
