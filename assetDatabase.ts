import { Asset } from "./types";
import fs from 'fs-extra';
import path from 'path';

const DB_FILE = path.join(__dirname, 'asset-db.json');

let db:any = {};

export function saveAsset(asset: Asset) {
  console.log("save", asset)
  db[asset.hash] = asset;
  persist();
}

export function getAsset(hash: string) {
  return db[hash];
}

const init = async ()=>{
    if (await fs.pathExists(DB_FILE)) {
        try{
            db = await fs.readJSON(DB_FILE);
        }
        catch(e){
            console.error('Error reading asset db:', e);
            console.log("Resetting asset db");
            await fs.writeJSON(DB_FILE, {});
        }
    }
    else {
        await fs.writeJSON(DB_FILE, {});
    }
}

const persist = async ()=>{
    await fs.writeJSON(DB_FILE, db, { spaces: 4 });
}

init();