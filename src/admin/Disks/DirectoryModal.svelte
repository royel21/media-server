<script>
  import { fade } from "svelte/transition";
  import CheckBox from "../Component/CheckBox.svelte";
  import Select from "src/ShareComponent/Select.svelte";
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

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Add <strong>{Name}</strong> To Directories</h3>
    </div>
    <div class="modal-body">
      <Select item={values} key="Type" {options} {onChange} />
      <CheckBox label="Is Adult" key="IsAdult" item={values} />
    </div>
    <div class="modal-footer">
      <button class="btn" on:click={create}>Create</button>
      <button class="btn" on:click={hideModal}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal {
    width: 300px;
  }
  .modal h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }
  strong {
    color: black;
    font-size: 16px;
  }
  :global(.input-label) {
    width: 120px;
  }
  :global(.input-control) {
    margin-bottom: 5px;
  }
</style>
