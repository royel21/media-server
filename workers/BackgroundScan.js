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
    let FilesType = /\.(rar|zip)/gi.test(firstFile.FileName)
        ? "mangas"
        : "videos";

    if (!fs.existsSync(FolderCover)) {
        let img = files.find((a) =>
            /\.(jpg|jpeg|png|gif|webp)/i.test(a.FileName)
        );
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

    return { Id: folder.Id, folder };
};

var tempFiles = [];
const PopulateDB = async (files, FolderId, folder) => {
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
                    let result = await createFolderAndCover(
                        f.FileName,
                        f.Files,
                        f
                    );
                    if (result.Id) {
                        await PopulateDB(f.Files, result.Id, result.folder);
                    }
                }
            }
        } catch (error) {
            console.log("folder-scan line:104", error);
            break;
        }
    }
    try {
        if (tempFiles.length > 0) {
            await db.file.bulkCreate(tempFiles);
            if (folder) {
                await folder.update({ CreatedAt: new Date() });
            }
        }
        tempFiles = [];
    } catch (err) {
        console.log("folder-scan line:102", err);
    }
};

const rmOrpFiles = async (folder) => {
    const files = await folder.getFiles();
    for (const file of files) {
        if (!fs.existsSync(path.join(folder.Path, file.Name))) {
            await file.destroy();
        }
    }
};

const rmOrphanFiles = async (Id, isFolder) => {
    console.log("remove olphan ");
    if (isFolder) {
        const folder = await db.folder.findByPk(Id);
        if (fs.existsSync(folder.Path)) {
            await rmOrpFiles(folder);
        } else {
            return true;
        }
    } else {
        const directory = await db.directory.findByPk(Id);
        if (fs.existsSync(directory.FullPath)) {
            const folders = await directory.getFolders();
            for (const folder of folders) {
                await rmOrpFiles(folder);
            }
        } else {
            return true;
        }
    }
};

const scanDirectory = async ({ id, dir, isFolder }) => {
    if (await rmOrphanFiles(id, isFolder)) return;

    DirectoryId = id;

    var fis = WinDrive.ListFilesRO(dir);
    let result = {};

    if (!isFolder && fis.filter((f) => !f.isDirectory).length > 0) {
        let folder = WinDrive.ListFiles(dir, { oneFile: true });
        result = await createFolderAndCover(dir, fis, folder);
    } else {
        await createFolderAndCover(dir, fis);
        result.Id = id;
    }
    try {
        await PopulateDB(fis, result.Id);
        console.log("job db end: ", id);
        await foldersThumbNails(folderCovers);
        console.log("job folder end:", id);
        await genScreenShot(id, isFolder);
        console.log("job screenshot end: ", result);
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
            await db.directory.update(
                { IsLoading: false },
                { where: { Id: data.id } }
            );
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
