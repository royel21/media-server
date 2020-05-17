const StreamZip = require("node-stream-zip");
const sharp = require("sharp");
const path = require("path");

const images = /jpg|jpeg|png|gif|webp/i;

// module.exports.RarCover = (file, coverP) => {
//     let rar = new rcunrar(file);
//     var list = rar.ListFiles().sort((a, b) => {
//         return String(a.Name).localeCompare(String(b.Name));
//     });

//     var firstImg = list.find(e => {
//         return images.includes(e.Extension.toLocaleLowerCase()) && e.Size > 1024 *
//             30
//     });

//     if (firstImg == undefined) return false;

//     var data = rar.ExtractFile(firstImg);
//     return new Promise((resolve, reject) => {
//         sharp(data).resize(240).jpeg({
//             quality: 80
//         }).toFile(coverP, (error) => {
//             resolve(coverP);
//         });
//     });
// }

const resize = async (coverP, buffer) => {
    let sharData = sharp(buffer);
    let meta = await sharData.metadata();
    if (meta.height > 1650) {
        sharData = await sharData.extract({
            height: 1200,
            width: meta.width,
            top: 0,
            left: 0,
        });
    }
    await sharData
        .jpeg({
            quality: 75,
        })
        .resize(240)
        .toFile(coverP);
};

var buff;
module.exports.ZipCover = (file, coverP, exist) => {
    var zip = new StreamZip({
        file,
        storeEntries: true,
    });
    return new Promise((resolve, reject) => {
        zip.on("ready", () => {
            var entries = Object.values(zip.entries())
                .sort((a, b) => {
                    return String(a.name).localeCompare(String(b.name));
                })
                .filter((entry) => {
                    return !entry.isDirectory;
                });

            var firstImg = entries.find((e) => {
                return images.test(e.name.split(".").pop()) && e.size > 1024 * 30;
            });

            if (exist) return resolve(entries.length);

            if (firstImg === undefined) {
                zip.close();
                resolve(0);
            } else {
                buff = zip.entryDataSync(firstImg);
                resize(coverP, buff)
                    .then(() => {
                        resolve(entries.length);
                        zip.close();
                        buff = [];
                    })
                    .catch((err) => {
                        zip.close();
                        console.log("thumbnail error", path.basename(file), err);
                        resolve(0);
                    });
            }
        });
        zip.on("error", (error) => {
            console.log("thumbnail error", path.basename(file), error);
            zip.close();
            resolve(0);
        });
    });
};
