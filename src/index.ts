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

// Graceful shutdown: disconnect every websocket so Twitch frees the EventSub
// transports immediately, instead of leaving "zombie" connections that pile up
// across restarts and cause "429 number of websocket transports limit exceeded".
let isShuttingDown = false;
async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`Received ${signal}, disconnecting streamers...`);
    // Safety net: force-exit before Docker's SIGKILL even if a disconnect hangs.
    const forceExit = setTimeout(() => {
        console.log("Shutdown timed out, forcing exit");
        process.exit(0);
    }, 8000);
    try {
        await streamerManager.stopAll();
    } catch (error) {
        console.error("Error during shutdown", error);
    }
    clearTimeout(forceExit);
    process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
