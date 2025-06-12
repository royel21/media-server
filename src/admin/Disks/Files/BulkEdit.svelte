<script>
  import Dialog from "../../../ShareComponent/Dialog.svelte";
  import CheckBox from "../../Component/CheckBox.svelte";
  import Input from "../../Component/Input.svelte";

  export let hide;
  export let files;
  export let acept;

  let item = {
    Regex: "",
    Replace: "",
    With: "",
    ZeroPad: 0,
    Case: "Camel",
    PreAdd: "",
    PostAdd: "",
    Secuence: "",
    After: "",
    Preserve: true,
  };

  let errors = [];

  const onConfirm = () => acept(item);

  const onKeydown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
</script>

<div id="b-edit">
  <Dialog class="bulk-edit" cancel={hide} confirm={onConfirm} {errors}>
    <h4 slot="modal-header">Edit Name for: <span>{files.length}</span> {files.length > 1 ? "Files" : "File"}</h4>
    <div class="dir-list" slot="modal-body">
      <Input key="Replace" {item} on:keydown={onKeydown} />
      <Input key="With" {item} on:keydown={onKeydown} />
      <div class="input-control-group">
        <Input label="Pre Add" key="PreAdd" {item} on:keydown={onKeydown} />
        <Input label="Post Add" key="PostAdd" {item} on:keydown={onKeydown} />
      </div>
      <div class="input-control-group">
        <Input key="Secuence" {item} type="number" min="0" on:keydown={onKeydown} />
        <Input key="After" {item} on:keydown={onKeydown} />
      </div>
      <Input key="Extension" {item} on:keydown={onKeydown} />
      <Input key="ZeroPad" {item} on:keydown={onKeydown} />
      <Input key="Regex" {item} on:keydown={onKeydown} />
      <CheckBox key="Preserve" {item} />
      <div class="input-control">
        <div id="t-label" class="input-label">Case Type</div>
        <div class="input">
          <label for="None"><input id="None" value="None" type="radio" bind:group={item.Case} /> None</label>
          <label for="Camel"><input id="Camel" value="Camel" type="radio" bind:group={item.Case} /> Camel</label>
          <label for="Upper"><input id="Upper" value="Upper" type="radio" bind:group={item.Case} /> Upper</label>
          <label for="Lower"><input id="Lower" value="Lower" type="radio" bind:group={item.Case} /> Lower</label>
        </div>
      </div>
    </div>
  </Dialog>
</div>

<style>
  #b-edit :global(.modal-container .modal) {
    min-width: 600px;
    max-width: 95%;
  }
  .dir-list :global(.input-label:not(#t-label)) {
    min-width: 85px;
    max-width: 85px;
    text-align: right;
    padding-right: 5px;
  }
  h4 span {
    color: firebrick;
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
    padding: 0px;
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
  @media screen and (max-width: 600px) {
    #b-edit :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
