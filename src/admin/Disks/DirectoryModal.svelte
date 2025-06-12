<script>
  import { fade } from "svelte/transition";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  export let createDirectory;
  export let hideModal;
  export let Name;

  let values = {
    Type: "Mangas",
    IsAdult: false,
  };

  const onChange = ({ target: { value } }) => {
    values.Type = value;
  };

  const options = [
    { Name: "Mangas", Id: "Mangas" },
    { Name: "Videos", Id: "Videos" },
  ];

  const create = () => {
    createDirectory(values.Type, values.IsAdult);
  };
</script>

<Dialog id="modal-watch" confirm={create} cancel={hideModal} btnOk="Create">
  <div slot="modal-header">
    <h3>Add <strong>{Name}</strong> To Directories</h3>
  </div>
  <div class="modal-body">
    <Select item={values} key="Type" {options} {onChange} />
    <CheckBox label="Is Adult" key="IsAdult" item={values} />
  </div>
</Dialog>

<style>
  :global(#modal-watch) {
    width: 360px;
  }
  h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }
  strong {
    color: black;
    font-size: 16px;
  }
  :global(#modal-watch .input-label) {
    width: 120px;
  }
  :global(#modal-watch .input-control) {
    margin-bottom: 5px;
  }
</style>
