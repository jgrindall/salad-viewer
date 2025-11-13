import { Asset } from "./types";
import fs from 'fs-extra';
import { getDBPath } from "./paths";

const DB_FILE = getDBPath();

let db:{[key:string]: Asset} = {};

export function saveAsset(asset: Asset) {
  db[asset.hash] = asset;
  persist();
}

export function getAsset(hash: string): Asset | undefined {
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

export const deleteAllAssets = async () => {
    db = {};
    await fs.writeJSON(DB_FILE, db, { spaces: 4 });
}

const fn = async ()=>{
    try{
        await init();
    }
    catch(e){
        console.warn('Failed to initialize asset database:', e);
    }
}

fn();
