<script>
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import Input from "../Component/Input.svelte";

  export let hide;
  export let length;
  export let acept;

  let firstInput;

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
    if (e.keyCode === 9 && e.target.type === "radio") {
      e.preventDefault();
      firstInput?.focus();
    }
  };
</script>

<div id="b-edit">
  <Dialog class="bulk-edit" cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
    <h4 slot="modal-header">Edit Name for <span>{length}</span> Files</h4>
    <div class="dir-list" slot="modal-body" on:keydown={onKeydown}>
      <Input bind:ref={firstInput} key="Replace" {item} focus={true} />
      <Input key="With" {item} />
      <div class="input-control-group">
        <Input label="Pre Add" key="PreAdd" {item} />
        <Input label="Post Add" key="PostAdd" {item} />
      </div>
      <div class="input-control-group">
        <Input key="Secuence" {item} type="number" min="0" />
        <Input key="After" {item} />
      </div>
      <Input key="Extension" {item} />
      <Input key="ZeroPad" {item} />
      <Input key="Regex" {item} />
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

  input[type="radio"] {
    position: relative;
  }

  input[type="radio"]:focus:after {
    position: absolute;
    top: 5px;
    left: 0;
    content: " ";
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 2px 1px #22deff;
  }

  @media screen and (max-width: 600px) {
    #b-edit :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
