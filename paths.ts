import path from "path";
import fs from "fs-extra";

// Base path for all uploads - use /var/data for Render compatibility because that is the persistent storage
const getBasePath = () => {
    return process.env.NODE_ENV === "production" 
        ? path.join("/var/data", "uploads") 
        : path.join(__dirname, "uploads");
};

export const getTempPath = () => {
    const tempPath = path.join(getBasePath(), "temp");
    fs.ensureDirSync(tempPath); // Ensure directory exists
    return tempPath;
};

export const getZipPath = () => {
    const zipPath = path.join(getBasePath(), "zips");
    fs.ensureDirSync(zipPath); // Ensure directory exists
    return zipPath;
};

export const getAssetPath = () => {
    const assetPath = path.join(getBasePath(), "assets");
    fs.ensureDirSync(assetPath); // Ensure directory exists
    return assetPath;
};

export const getActivitiesPath = () => {
    const activitiesPath = path.join(getBasePath(), "activities");
    fs.ensureDirSync(activitiesPath); // Ensure directory exists
    return activitiesPath;
};


