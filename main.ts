import express from "express";
import fs from "fs-extra";
import path from "path";
import cors from "cors";
import ZipExtractor from "./zipExtractor";
import {IncomingForm} from "formidable";
import { getAsset } from "./assetDatabase";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', async (req:any, res:any) => {
    try { 
        const form = new IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = path.join(__dirname, 'uploads', 'zips');
        form.parse(req, async (err:any, fields:any, files:any) => {
            //get the file
            const zipFile = files.zipfile[0] || files.zipfile;
            const tempPath = path.join(form.uploadDir, zipFile.newFilename);
            // where to put it
            const extractPath = path.join(__dirname, 'uploads', 'temp', path.basename(zipFile.newFilename, '.zip'));
            await fs.ensureDir(extractPath);
            // extract it all
            const extractor = new ZipExtractor(tempPath, extractPath);
            const id = await extractor.extract();

            res.json({ 
                success: true,
                id
            });
        })
    }
    catch (error) {
        console.error('Error processing zip:', error);
        res.status(500).json({ error: 'Failed to process the zip file' });
    }
});

app.get('/view/:activityId', async (req:any, res:any) => {
    const activityId = req.params.activityId;
    const viewerPath = path.join(__dirname, 'public', 'viewer.html');
    let html = await fs.readFile(viewerPath, 'utf8');
    const activityPath = path.join(__dirname, 'uploads', 'activities', `activity-${activityId}.json`);
    const json = await fs.readJson(activityPath);
    const pages = json.edit.pages;
    const assets = json.assets;

    const assetMap = {}
    assets.forEach((asset:any) => {
        assetMap[asset.name] = {
            type: asset.type,
            src: asset.src,
            contentType: asset.contentType
        }
    });
    
    const script = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
            const api = window.getApi(${JSON.stringify(assetMap, null, 4)});
            const container = document.getElementById("salad_container");
            const options = {
                mode: "play",
                container,
                api,
                pages: ${JSON.stringify(pages, null, 4)}
            };

            Salad.Factory.createActivity(options);
        });
      </script>
    `;
    
    // Insert the script right before the closing body tag
    html = html.replace('</body>', `${script}\n</body>`);
    res.send(html);
});

const getContentTypeForAsset = (hash:string)=>{
    const asset = getAsset(hash);
    return asset.contentType || "image/png";
}

app.get('/asset/hash/:hash', async (req: any, res: any) => {
    const hash = req.params.hash;
    console.log("get asset2", hash);
    const contentType = getContentTypeForAsset(hash);

    const assetPath = path.join(__dirname, 'uploads', 'assets', hash);
    res.setHeader('Content-Type', contentType);
    res.sendFile(assetPath);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});