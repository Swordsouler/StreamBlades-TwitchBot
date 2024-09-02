import "dotenv/config";
import { StreamerManager } from "./models/StreamerManager";
import { StreamBlades } from "./models/Users/ChatBot";
var cron = require("node-cron");

const streamerManager = new StreamerManager();

//everyday at mindnight streamerManager.loadStreamers()
cron.schedule("0 0 * * *", () => {
    streamerManager.loadStreamers();
});

// Cron job to delete duplicate display names every hour
cron.schedule("0 * * * *", () => {
    StreamBlades.archive();
    StreamBlades.deleteDuplicateDisplayName();
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
