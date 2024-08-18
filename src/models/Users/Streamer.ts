import { FollowSubscription } from "../Events/Follow";
import { EventSubscription } from "../Events/TwitchEvent";
import { Resource } from "../RDFBase";
import { User } from "./User";

export class Streamer extends User {
    private tes: any;

    constructor(userId: string, displayName?: string, refreshToken?: string) {
        super(userId, displayName, refreshToken);
        this.userId = userId;
        this.refreshToken = refreshToken;
        this.addProperty(new Resource("a"), new Resource("Streamer"));
    }

    protected onReady(): void {
        super.onReady();
        this.connect();
        this.subscribeToAllEvents();
    }

    public async connect() {
        const TES = require("tesjs");
        this.tes = new TES({
            identity: {
                id: process.env.TWITCH_CLIENT_ID,
                secret: process.env.TWITCH_CLIENT_SECRET,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
            },
            listener: {
                type: "websocket",
            },
        });
    }

    public async subscribe(event: EventSubscription): Promise<any> {
        const sub = await this.tes.subscribe(
            event.type,
            event.condition,
            event.version
        );
        await this.tes.on(event.type, event.callback);
        return sub;
    }

    public async unsubscribe(subscription: any): Promise<void> {
        await this.tes.unsubscribe(subscription);
    }

    private subscribeToAllEvents() {
        this.subscribe(new FollowSubscription(this.userId));
    }
}

/*
export class Streamer extends TwitchUser {
    constructor(id: string, accessToken: string, refreshToken: string) {
        super(new Resource(id));
        this.twitchId = id;
        this.twitchConnector = new TwitchConnector(accessToken, refreshToken);
        this.twitchConnector.subscribe(
            {
                type: "channel.follow",
                condition: {
                    broadcaster_user_id: this.twitchId,
                    moderator_user_id: this.twitchId,
                },
                version: "2",
            },
            (data: any) => {
                console.log(data);
            }
        );
        this.twitchConnector.subscribe(
            {
                type: "channel.chat.message",
                condition: {
                    broadcaster_user_id: this.twitchId,
                    user_id: this.twitchId,
                },
            },
            (data: any) => {
                console.log(data);
            }
        );
    }
}
*/
