import "dotenv/config";
import { StreamerManager } from "./models/StreamerManager";
var cron = require("node-cron");

const streamerManager = new StreamerManager();

//everyday at mindnight streamerManager.loadStreamers()
cron.schedule("0 0 * * *", () => {
    streamerManager.loadStreamers();
});

// Cron job to delete duplicate display names every hour
cron.schedule("0 * * * *", () => {
    fetch(process.env.DELETE_DUPLICATE_DISPLAY_NAME_URL, {
        method: "POST",
    })
        .then((res) => {
            console.log("deleteDuplicateDisplayName: OK");
        })
        .catch((error) => {
            console.error("deleteDuplicateDisplayName: " + error.status);
        });

    fetch(process.env.ARCHIVE_URL, {
        method: "POST",
    })
        .then((res) => {
            console.log("archive: OK");
        })
        .catch((error) => {
            console.error("archive: " + error.status);
        });
});

const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
    let date = new Date();
    let timestamp =
        date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    originalConsoleLog.apply(console, [`[${timestamp}]`, ...args]);
};
