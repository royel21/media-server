<script>
  const datas = {
    links: [],
    page: 0,
    totalpage: 0,
    totalItems: 0,
  };
</script>

<div class="container">
  <h2>Downloads</h2>
  <div class="t-container">
    <table id="dir-list" class="table table-dark table-hover table-bordered">
      <thead>
        <tr>
          <th>{datas.totalItems}</th>
          <th>Actions</th>
          <th>Server</th>
          <th>Chapter</th>
          <th>Name</th>
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>items</td>
          <td>items</td>
          <td>items items items</td>
          <td>items items items</td>
          <td>items items items</td>
          <td>10/6/2023 04:53</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
  }
  h2 {
    text-align: center;
  }
  .t-container {
    width: 100%;
    min-height: calc(100% - 35px);
    overflow-x: auto;
  }
  .table {
    min-width: max-content;
    margin: 0;
  }
  th:first-child {
    width: 50px;
    min-width: 50px;
  }
</style>
