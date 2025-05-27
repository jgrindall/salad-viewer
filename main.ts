import fs from "fs-extra";
import path from "path";
import cors from "cors";
import ZipExtractor from "./zipExtractor";
import { Fields, Files, Error as FormidableError, IncomingForm } from 'formidable';
import { getAsset } from "./assetDatabase";
import { getZipPath, getTempPath, getActivitiesPath, getAssetPath } from "./paths";
import express, { Request, Response } from 'express';
import { JSONAsset, JSONActivity } from "./types";
import { list } from "./activitiesDatabase";

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

app.get('/admin', (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/admin/upload', async (req:Request, res:Response) => {
    try { 
        const form = new IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = getZipPath();
        form.parse(req, async (err:FormidableError, fields:Fields, files:Files) => {
            //get the file
            const zipFile = files.zipfile[0] || files.zipfile;
            const tempPath = path.join(getZipPath(), zipFile.newFilename);

            // where to put it
            const extractPath = path.join(getTempPath(), path.basename(zipFile.newFilename, '.zip'));
            await fs.ensureDir(extractPath);

            // extract it all
            const extractor = new ZipExtractor(tempPath, extractPath);
            const id = await extractor.extract();
            
            // go to the activity
            res.redirect(`/view/${id}`);

        });
    }
    catch (error) {
        console.error('Error processing zip:', error);
        res.status(500).json({ error: 'Failed to process the zip file' });
    }
});

/**
 * View an activity
 */
app.get('/view/:activityId', async (req: Request, res:Response) => {
    const activityId = req.params.activityId;

    if (!activityId) {
        res
        .status(404)
        .sendFile(path.join(__dirname, 'public', '404.html'));
        return;
    }

    const viewerPath = path.join(__dirname, 'public', 'viewer.html');
    

    // basic html
    let html = await fs.readFile(viewerPath, 'utf8');

    // Read the activity file
    const activityPath = path.join(getActivitiesPath(), `activity-${activityId}.json`);

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

    
    
    const pages = json.pages;
    const data = json.data;
    const script = json.script;
    const fonts = json.fonts;
    
    const assetMap = {};
    
    (json.assets || []).forEach((asset: JSONAsset) => {
        assetMap[asset.name] = {
            type: asset.type,
            src: asset.src,
            contentType: asset.contentType
        }
    });

    // Make a script to load the activity
    const scriptSrc = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {

            const container = document.getElementById("salad_container");
            
            const api = window.getApi(${JSON.stringify(assetMap, null, 4)});
        
            const data = ${JSON.stringify(data, null, 4)};
        
            const script = ${JSON.stringify(script, null, 4)};
        
            const pages = ${JSON.stringify(pages, null, 4)};

            const fonts = ${JSON.stringify(fonts, null, 4)};
        
            const options = {
                mode: "play",
                container,
                data,
                api,
                fonts,
                pages
            };

            Salad.Factory.createActivity(options);
        });
      </script>
    `;
    
    // Insert the script right before the closing body tag
    html = html.replace('</body>', `${scriptSrc}\n</body>`);
    res.send(html);
});


/**
 * Get an asset by its hash
 */
app.get('/asset/hash/:hash', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    console.log("get asset", hash);
    const asset = getAsset(hash);
    const assetPath = path.join(getAssetPath(), hash);
    res.setHeader('Content-Type', asset.contentType || "image/png");
    res.sendFile(assetPath);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});