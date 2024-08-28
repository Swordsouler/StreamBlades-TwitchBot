import "dotenv/config";
import { StreamerManager } from "./models/StreamerManager";
import { Streamer } from "./models/Users/Streamer";
var cron = require("node-cron");

const streamerManager = new StreamerManager();

/*const Swordsouler = new Streamer(
    "107968853",
    "",
    "0do9olkmornqn8fjxlfdz66ri7vgad38rd49ejq5yrczw90ab1"
);*/

//deleteDuplicateDisplayName();
const deleteDuplicateDisplayName = async () => {
    try {
        await fetch(process.env.DELETE_DUPLICATE_DISPLAY_NAME_URL, {
            method: "POST",
        });
        console.log("deleteDuplicateDisplayName: OK");
    } catch (error) {
        console.error("deleteDuplicateDisplayName: " + error.status);
    }
};

// Cron job to delete duplicate display names every hour
cron.schedule("0 * * * *", () => {
    deleteDuplicateDisplayName();
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
