window.saladUtils = {
    listActivities: async () => {
        const response = await fetch("/api/list", {});
        const activities = await response.json();
        return activities;
    },
    deleteActivity: async (activityId) => {
        const response = await fetch("/api/delete/" + activityId, {
            method: "DELETE"
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        }
        else {
            alert("Failed to delete activity: " + data.error);
        }
    },
    deleteAll: async () => {
        const response = await fetch("/api/wipe", {
            method: "DELETE"
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        }
        else {
            alert("Failed to delete all activities: " + data.error);
        }
    },
}

