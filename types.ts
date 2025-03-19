// the asset object in the asset-db.json file
export type Asset = {
    key: string,
    hash:string,
    type: string,
    size: number,
    contentType:string
}


// the asset object in the activity.json file
export type JSONAsset = {
    id:string,
    name:string,
    src:string,
    type:string,
    contentType:string
}
