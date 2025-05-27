import fs from 'fs-extra';
import { getActivitiesPath } from "./paths";

export function list(): any[] {
    const folder = getActivitiesPath();
    const files = fs.readdirSync(folder);
    return files;
}