import path from "path";
import { config } from "dotenv";
config();

export const ImagesPath = process.env.IMAGES;

export const getFileType = ({ FilesType }) => (FilesType === "mangas" ? "Manga" : "Video");

export const getCoverPath = (name) => path.join(ImagesPath, "Folder", name + ".jpg");
