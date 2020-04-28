<script>
  import FilesList from "../Component/FilesList.svelte";
  let files = [
    {
      Id: "001",
      Name: "Naruto",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "002",
      Name: "Naruto Shippuden",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "003",
      Name: "One Piece",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "004",
      Name:
        "Darken than Black - 01 more than the eye meets  more than the eye meets  more than the eye meets",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "004",
      Name: "Darken than Black",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "004",
      Name: "Darken than Black",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "004",
      Name: "Darken than Black",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    },
    {
      Id: "004",
      Name: "Darken than Black",
      Type: "Video",
      CurrentPos: 0,
      Duration: 780,
      Cover: "/covers/Video/Naruto 1.jpg",
      isFav: true
    }
  ];
</script>

<style>
  .files-list {
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 32px);
    overflow-y: auto;
  }
</style>

<div class="files-list">
  <FilesList type="favorites" {files} />
</div>
