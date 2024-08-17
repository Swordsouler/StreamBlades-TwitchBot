import "dotenv/config";
import { RDFBase, Resource, Triple, XSDData } from "./models/RDFBase";
import { access } from "fs";

const TES = require("tesjs");

const RDF = new RDFBase(new Resource("10791592"));
RDF.addProperty(new Resource("hasBadge"), new Resource("Moderator"));
RDF.addProperty(new Resource("hasBadge"), new Resource("Streamer"));
RDF.addProperty(new Resource("hasBadge"), new Resource("VS"));
RDF.addProperty(new Resource("hasName"), new XSDData("Swordsouler", "string"));

const RDF2 = new RDFBase(new Triple("10791592", "hasBadge", "VS"));
RDF2.addProperty(
    new Resource("hasTime"),
    new XSDData("2021-09-01T00:00:00Z", "dateTime")
);
RDF2.addProperty(
    new Resource("hasTime"),
    new XSDData("2021-09-01T00:00:00Z", "dateTime")
);

console.log(RDF.toString());
console.log(RDF2.toString());

const tes = new TES({
    identity: {
        id: process.env.TWITCH_CLIENT_ID,
        secret: process.env.TWITCH_CLIENT_SECRET,
        accessToken: "wfff2hujuj5n9xjc64y5aktak6q9hv",
        refreshToken: "zmivaw9virawgy1r97dpvihk8lpjw834b4t9p58ujzb60ak3ki",
    },
    listener: {
        type: "websocket",
        /*type: "webhook",
        baseURL: "https://example.com",
        secret: process.env.TWITCH_WEBHOOKS_SECRET,
        */
    },
});

tes.on("channel.chat.message", (data: any) => {
    console.log(data);
});
tes.on("channel.follow", (data: any) => {
    console.log(data);
});

tes.subscribe("channel.chat.message", {
    broadcaster_user_id: "107968853",
    user_id: "107968853",
})
    .then(() => {
        console.log("Subscription successful");
    })
    .catch((err) => {
        console.log("channel.chat.message", err);
    });
tes.subscribe(
    "channel.follow",
    { broadcaster_user_id: "107968853", moderator_user_id: "107968853" },
    2
)
    .then(() => {
        console.log("Subscription successful");
    })
    .catch((err) => {
        console.log("channel.follow", err);
    });

async function GetAccessToken(refreshToken: string) {
    const result = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
        }),
    });
    const data = await result.json();
    return data.access_token;
}

async function SendMessage(
    message: string,
    to: string,
    as: string,
    accessToken: string
) {
    const result = await fetch("https://api.twitch.tv/helix/chat/messages", {
        method: "POST",
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            broadcaster_id: to,
            sender_id: as,
            message: message,
        }),
    });
    return result.json();
}
// send a message to the chat
/*fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${"wfff2hujuj5n9xjc64y5aktak6q9hv"}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        broadcaster_id: "107968853",
        sender_id: process.env.TWITCH_BOT_ID,
        message: "Hello World",
    }),
})
    .then((res) => {
        res.json().then((data) => {
            console.log(data);
        });
    })
    .catch((err) => {
        err.json().then((data) => {
            console.log(data);
        });
    });
*/
//
GetAccessToken(process.env.TWITCH_BOT_REFRESH_TOKEN).then(async (token) => {
    const result = await SendMessage(
        "Hello World",
        "107968853",
        process.env.TWITCH_BOT_ID,
        token
    );
    console.log(result);
});
