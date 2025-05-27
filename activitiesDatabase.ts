import fs from 'fs-extra';
import path from "path";
import { getActivitiesPath } from "./paths";

export function list(): string[] {
    const folder = getActivitiesPath();
    const files = fs.readdirSync(folder);
    return files;
}

export function deleteActivity(activityId: string): boolean {
    const filePath = getActivityPath(activityId);
    console.log("deleteActivity", activityId, filePath, fs.existsSync(filePath));
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

export function deleteAllActivities(): void {
    const folder = getActivitiesPath();
    const files = fs.readdirSync(folder);
    for (const file of files) {
        const filePath = path.join(folder, file);
        fs.unlinkSync(filePath);
    }
}

export function getActivityPath(activityId: string): string {
    const activityPath = path.join(getActivitiesPath(), `activity-${activityId}.json`);
    return activityPath;
}

