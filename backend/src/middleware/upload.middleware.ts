// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async () => ({
//     folder: "twitter_clone",
//     resource_type: "auto",
//   }),
// });

// export const upload = multer({ storage });



import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async () => ({
//     folder: "twitter-clone",
//     resource_type: "auto",
//   }),
// });



const storage = multer.memoryStorage();


export const upload = multer({ storage });  