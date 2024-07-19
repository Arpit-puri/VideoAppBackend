const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

/**This function is used so that we can first upload user file on server public folder in our case
 * after that we can fetch that file from our server adn upload here
 * this can be done directly also without this function but this function will
 * help in any case cloudnary server is slower than ours
 */
exports.uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(localFilePath, {
        resource_type: "auto",
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(`url is ${uploadResult.url} and /n ${uploadResult}`);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove locally save temp file if upload failed
    return null;
  }
};
