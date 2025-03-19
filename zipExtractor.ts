import extractZip from "extract-zip";
import fs  from "fs-extra";
import path from "path";
import { Asset, JSONAsset } from "./types";
import { saveAsset } from "./assetDatabase";
import { getActivitiesPath } from "./paths";
import { getAssetPath } from "./paths";

class ZipExtractor{

    private zipFilePath: string;
    private extractPath: string;

    constructor(zipFilePath:string, extractPath: string){
        this.zipFilePath = zipFilePath;
        this.extractPath = extractPath;
    }

    async extractAsset(asset: Asset){
        const assetSourcePath = path.join(this.extractPath, 'assets', asset.key);
        console.log("asset", asset, assetSourcePath);
        const assetDestPath = path.join(getAssetPath(), asset.hash);
        saveAsset(asset);
        await fs.copy(assetSourcePath, assetDestPath);
    }

    async extract(): Promise<string> {
        await extractZip(this.zipFilePath, {
            dir: this.extractPath
        });
    
        const manifestPath = path.join(this.extractPath, 'manifest.json');
        const manifest = await fs.readJson(manifestPath) as { assets: Asset[] };

        const id = Math.random().toString(36).substring(7);

        const activityId = `activity-${id}`;
    
        for (const asset of manifest.assets || []) {
            await this.extractAsset(asset);
        }
    
        const activityDestPath = path.join(getActivitiesPath(), `${activityId}.json`);
       
        // read the activity.json file
        const activityPath = path.join(this.extractPath, 'activity.json');
        const activity = await fs.readJson(activityPath);

        const getHashForKey = (key:string) => {
            const lookUpInManifest = manifest.assets.find((a: Asset) => a.key === key);
            return lookUpInManifest ? lookUpInManifest.hash : null;
        }

        activity.assets.forEach((a: JSONAsset) => {
            const hash = getHashForKey(a.name);
            a.src = `/asset/hash/${hash}`;
        });

        await fs.writeJson(activityDestPath, activity, {
            spaces: 4
        });

        return id;
    
    }
}

export default ZipExtractor;