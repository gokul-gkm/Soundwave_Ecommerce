const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const folderPart = parts[parts.length - 2];
  const publicId = lastPart.split(".")[0];
  return `${folderPart}/${publicId}`;
};

module.exports = {
  getPublicId,
};
