<script>
  import Icons from "src/icons/Icons.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";

  export let loadItems;
  export let datas;

  const gotopage = ({ detail }) => {
    datas.page = detail;
    loadItems();
  };

  const changeItems = ({ keyCode }) => {
    if (keyCode === 13) {
      datas.page = 1;
      loadItems();
    }
  };

  $: localStorage.setItem("d-items", datas.items);
</script>

<span>
  <Pagination page={datas.page} totalPages={datas.totalPages} on:gotopage={gotopage} />
  <div class="input-group d-items">
    <span class="input-group-text"><Icons name="list" color="black" /></span>
    <input type="number" class="form-control" bind:value={datas.items} on:keydown={changeItems} />
  </div>
</span>
