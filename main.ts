import fs from "fs-extra";
import path from "path";
import cors from "cors";
import ZipExtractor from "./zipExtractor";
import { Fields, Files, Error as FormidableError, IncomingForm } from 'formidable';
import { getAsset } from "./assetDatabase";
import { getZipPath, getTempPath, getAssetPath } from "./paths";
import express, { Request, Response } from 'express';
import { JSONAsset, JSONActivity } from "./types";
import { list, deleteActivity, getActivityPath, deleteAllActivities, getIdFromPath } from "./activitiesDatabase";
import { deleteAllAssets } from "./assetDatabase";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

console.log("starting...")

app.get('/', (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api/list", async (req:Request, res:Response) => {
    const activities = list();
    res.json(activities);
})

app.delete("/api/delete/:activityId", async (req:Request, res:Response) => {
    const activityId = req.params.activityId as string;
    console.log("delete activity", activityId);
    const success = deleteActivity(activityId);
    res.json({
        success: success
    });
})

app.delete("/api/wipe", async (req:Request, res:Response) => {
    deleteAllActivities();
    deleteAllAssets();
    res.json({
        success: true
    });
})

app.get('/admin', (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/admin/upload', async (req:Request, res:Response) => {
    try { 
        const form = new IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = getZipPath();
        form.parse(req, async (err:FormidableError, fields:Fields, files:Files) => {
            //get the file(s)

            const zipFiles = Array.isArray(files.zipfile) ? files.zipfile : [files.zipfile];

            let idsExtracted = [];

            for (const zipFile of zipFiles) {
                const tempPath = path.join(getZipPath(), zipFile.newFilename);

                // where to put it
                const extractPath = path.join(getTempPath(), path.basename(zipFile.newFilename, '.zip'));
                await fs.ensureDir(extractPath);

                // extract it all
                const extractor = new ZipExtractor(tempPath, extractPath);
                const id = await extractor.extract();
                idsExtracted.push(id);
            }

            // go to the activity
            if(idsExtracted.length === 1){
                res.redirect(`/view/${idsExtracted[0]}`);
            }
            else{
                res.redirect(`/admin`);
            }
        });
    }
    catch (error) {
        console.error('Error processing zip:', error);
        res.status(500).json({ error: 'Failed to process the zip file' });
    }
});

app.get('/api/activity/:activityId', async (req: Request, res:Response) => {
    const activityId = req.params.activityId;

    if (!activityId) {
        res
        .status(404)
        .json({});
        return;
    }

    // Read the activity file
    const activityPath = getActivityPath(activityId);

    let json: any = {};

    try{
        json = await fs.readJson(activityPath) as JSONActivity;

        if (!json) {
            res
            .status(404)
            .sendFile(path.join(__dirname, 'public', '404.html'));
            return;
        }
    }
    catch (e) {
        res
        .status(404)
        .sendFile(path.join(__dirname, 'public', '404.html'));
        return;
    }
 
    const assetMap = {};

    (json.assets || []).forEach((asset: JSONAsset) => {
        assetMap[asset.name] = {
            type: asset.type,
            src: asset.src,
            contentType: asset.contentType
        }
    });

    const activityData = {
        assetMap,
        data: json.data,
        script: json.script,
        pages: json.pages,
        fonts: json.fonts
    };
    
    res.json(activityData);
});

/**
 * View an activity
 */
app.get('/view/:activityId', async (req: Request, res:Response) => {
    const viewerPath = path.join(__dirname, 'public', 'viewer.html');
    res.sendFile(viewerPath);
});


app.get('/view', async (req: Request, res:Response) => {
    // If no activityId is provided
    const activities = list();
    console.log("activities", activities);
    const activityPath = activities.length > 0 ? activities[0] : null;
    if (!activityPath) {
        res.status(404).send('Activity not found');
    }
    else{
        const activityId = getIdFromPath(activityPath);
        res.redirect(`/view/${activityId}`);
    }
});


/**
 * Get an asset by its hash
 */
app.get('/asset/hash/:hash', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    console.log("get asset", hash);
    const asset = getAsset(hash);
    if(asset){
        const assetPath = path.join(getAssetPath(), hash);
        res.setHeader('Content-Type', asset.contentType || "image/png");
        res.sendFile(assetPath);
    }
    else{
        res.status(404).send('Asset not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});