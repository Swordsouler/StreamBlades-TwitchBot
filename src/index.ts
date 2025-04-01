import "dotenv/config";
import { StreamerManager } from "./models/StreamerManager";
import { StreamBlades } from "./models/Users/ChatBot";
var cron = require("node-cron");

const streamerManager = new StreamerManager();

/*setTimeout(() => {
    streamerManager.loadStreamers();
}, 60000);*/

// everyday at midnight streamerManager.loadStreamers() to reload the streamers
/*cron.schedule("0 0 * * *", () => {
    streamerManager.loadStreamers();
});*/

// every hour, archive the streamers and delete the duplicates display names
cron.schedule("0 * * * *", () => {
    StreamBlades.archive();
    StreamBlades.deleteDuplicateDisplayName();
});
setTimeout(() => {
    StreamBlades.archive();
    StreamBlades.deleteDuplicateDisplayName();
}, 60000);

const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
    let date = new Date();
    let timestamp =
        date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    originalConsoleLog.apply(console, [`[${timestamp}]`, ...args]);
};
