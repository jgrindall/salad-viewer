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
    resetRewards: async () => {
        window.sessionStorage.removeItem("learnandearn-rewards");
    },
    addReward: (activityId) => {
        const rewardsArray = saladUtils.listRewards();
        if (!rewardsArray.includes(activityId)) {
            rewardsArray.push(activityId);
            window.sessionStorage.setItem("learnandearn-rewards", rewardsArray.join(","));
        }
    },
    listRewards: () => {
        const rewards = window.sessionStorage.getItem("learnandearn-rewards") || "";
        return rewards.split(",").filter(Boolean);
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
    getActivityData: async (activityId) => {
        const response = await fetch(`/api/activity/${activityId}`);
        const activityData = await response.json();
        return activityData;
                
    }
}

