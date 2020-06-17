const WinDrive = require("win-explorer");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
// const { NormalizeName, Capitalize } = require("../Utils/StringUtil");

const db = require("../models");

const { genScreenShot, foldersThumbNails } = require("./generate-screenshot");

const allExt = /\.(avi|avi2|mp4|mkv|ogg|webm|rar|zip)/i;
const imgPath = process.env.IMAGES;
//Create all Folders Needed
const coverPath = path.join(imgPath, "Folder");
fs.mkdirsSync(coverPath);
fs.mkdirsSync(path.resolve(imgPath, "Manga"));
fs.mkdirsSync(path.resolve(imgPath, "Video"));

var DirectoryId;

var folderCovers = [];

const createFolderAndCover = async (dir, files, fd) => {
    let firstFile = files.find((a) => allExt.test(a.FileName));
    if (!firstFile) return "";
    let Name = path.basename(dir);
    let FolderCover = path.join(coverPath, Name + ".jpg");
    let FilesType = /\.(rar|zip)/gi.test(firstFile.FileName) ? "mangas" : "videos";

    if (!fs.existsSync(FolderCover)) {
        let img = files.find((a) => /\.(jpg|jpeg|png|gif|webp)/i.test(a.FileName));
        if (img) {
            try {
                await sharp(path.join(dir, img.FileName))
                    .jpeg({ quality: 75 })
                    .resize({ height: 160 })
                    .toFile(FolderCover);
            } catch (err) {
                console.log("sharp error:", err, img.FileName);
            }
        } else {
            if (firstFile) {
                folderCovers.push({
                    folder: true,
                    filePath: path.join(dir, firstFile.FileName),
                    coverPath: FolderCover,
                    FilesType,
                });
            }
        }
    }
    //Create Folder
    let folder = await db.folder.findOne({ where: { Name, FilesType } });

    let FileCount = files.filter((f) => allExt.test(f.FileName)).length;

    if (!folder) {
        let CreatedAt = fd.LastModified;
        folder = await db.folder.create({
            Name,
            DirectoryId,
            Cover: FolderCover,
            CreatedAt,
            FileCount,
            FilesType,
            Path: dir,
        });
    } else {
        await folder.update({ Cover: FolderCover, FileCount });
    }

    return folder.Id;
};

var tempFiles = [];
const PopulateDB = async (files, FolderId) => {
    let filteredFile = files.filter(
        (f) => f.isDirectory || (allExt.test(f.FileName) && !f.isHidden)
    );
    let folderFiles = await db.file.findAll({ where: { FolderId } });
    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let found = tempFiles.filter((v) => v.Name === f.FileName);
                let vfound = folderFiles.find((fd) => fd.Name === f.FileName);

                if (found.length === 0 && !vfound) {
                    tempFiles.push({
                        Name: f.FileName,
                        Type: /rar|zip/gi.test(f.extension) ? "Manga" : "Video",
                        FolderId,
                        Size: f.Size,
                        CreatedAt: f.LastModified,
                    });
                }
            } else {
                if (f.Files.length > 0) {
                    console.log("folder: ", f.FileName);
                    let fId = await createFolderAndCover(f.FileName, f.Files, f);
                    if (fId) {
                        await PopulateDB(f.Files, fId);
                    }
                }
            }
        } catch (error) {
            console.log("folder-scan line:104", error);
            break;
        }
    }
    try {
        if (tempFiles.length > 0) await db.file.bulkCreate(tempFiles);
        tempFiles = [];
    } catch (err) {
        console.log("folder-scan line:102", err);
    }
};

const removeOrphanFiles = async (Id, isFolder) => {
    let files;
    let dir = "";
    if (isFolder) {
        let folder = await db.folder.findOne({
            where: { Id },
            include: { model: db.file },
        });
        files = await folder.Files;
        dir = folder.Path;
    } else {
        files = await db.file.findAll({
            include: {
                model: db.folder,
                where: { DirectoryId: Id },
                required: true,
            },
        });
        let file = files[0];
        if (!file) return;
        dir = files[0].Folder.Path;
    }
    for (let f of files) {
        if (!fs.existsSync(path.join(f.Folder.Path, f.Name))) {
            await f.destroy();
        }
    }
};

const scanDirectory = async ({ id, dir, isFolder }) => {
    await removeOrphanFiles(id, isFolder);

    DirectoryId = id;

    var fis = WinDrive.ListFilesRO(dir);
    let folderId;

    if (!isFolder && fis.filter((f) => !f.isDirectory).length > 0) {
        let folder = WinDrive.ListFiles(dir, { oneFile: true });
        folderId = await createFolderAndCover(dir, fis, folder);
    } else {
        folderId = id;
        await createFolderAndCover(dir, fis);
    }
    try {
        await PopulateDB(fis, folderId);
        console.log("job db end: ", id);
        await foldersThumbNails(folderCovers);
        console.log("job folder end:", id);
        await genScreenShot(id, isFolder);
        console.log("job screenshot end: ", id);
    } catch (err) {
        console.log("line 14:", err);
    }
};

const pendingJobs = [];
const processJobs = async () => {
    while (pendingJobs.length > 0) {
        try {
            let data = pendingJobs.pop();
            await scanDirectory(data);
            await db.directory.update({ IsLoading: false }, { where: { Id: data.id } });
            process.send(data);
        } catch (err) {
            console.log("folder-scan line:135", err);
        }
    }
    process.exit();
};
var running = false;
process.on("message", (data) => {
    pendingJobs.push(data);
    db.directory.update({ IsLoading: true }, { where: { Id: data.id } });
    if (!running) {
        running = true;
        processJobs();
    }
});
