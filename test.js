// const db = require("./models");

// const testDb = async () => {
//   let file = await db.file.getFile("Administrator");
// };

// db.init().then(testDb);
const db = require("./models");
const { getOrderBy} = require('./routes/query-helper')

const getFolders = async (req, res) => {
  const { filetype, order, page, items, search } = req.params;
  let favs = req.user.Favorites.map((f) => f.Id).join("','");
  console.log(favs);
  let favSelect =
    "Select FolderId from FavoriteFolders where FolderId == Id and FavoriteId IN";
  let result = await db.folder.findAndCountAll({
    attributes: [
      "Id",
      "Name",
      "Cover",
      "Type",
      "FilesType",
      "CreatedAt",
      "FileCount",
      [db.sqlze.literal(`( ${favSelect} ('${favs}'))`), "isFav"],
    ],
    where: {
      Name: {
        [db.Op.like]: `%${search || ""}%`,
      },
      FilesType: filetype,
    },
    order: getOrderBy(order, "Files."),
    offset: (page - 1) * items,
    limit: items,
  });

  return res.json({
    files: result.rows,
    totalFiles: result.count,
    totalPages: Math.ceil(result.count / items),
  });
};

const req = {body: {filetype: " Manga", order: "nu", page: 1, items:"10", search: ""}};
const res = {send: (data)=> {console.log(data)}}
const test = (async = () => {
  let user = await db.user.findOne({
    where: { Name: "Administrator" },
    include: { model: db.favorite },
  });
  req.user = user;
  
  await getFolders(req, res);
});
