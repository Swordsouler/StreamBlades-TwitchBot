import { MessageSubscription } from "../Events/Subscriptions/MessageSubscription";
import { FollowSubscription } from "../Events/Subscriptions/FollowSubscription";
import { Resource } from "../RDFBase";
import { User } from "./User";
import { EventSubscription } from "../Events/Subscriptions/EventSubscription";
import { Follow } from "../Events/Follow";
import { Message } from "../Events/Message";
import BTTV from "../Emote/BTTVEmote";
import { StreamOnlineSubscription } from "../Events/Subscriptions/StreamOnlineSubscription";
import { LiveStream } from "../LiveStream";
import { StreamOfflineSubscription } from "../Events/Subscriptions/StreamOfflineSubscription";
import { SubscribeSubscription } from "../Events/Subscriptions/SubscribeSubscription";
import { Subscribe } from "../Events/Subscribe";
import { SubscriptionGiftSubscription } from "../Events/Subscriptions/SubscriptionGiftSubscription";
import { SubscriptionGift } from "../Events/SubscriptionGift";
import { SubscriptionMessageSubscription } from "../Events/Subscriptions/SubscriptionMessageSubscription";
import { SubscriptionMessage } from "../Events/SubscriptionMessage";
import { HypeTrain } from "../Events/HypeTrain";
import { HypeTrainEndSubscription } from "../Events/Subscriptions/HypeTrainEndSubscription";
import { PollEndSubscription } from "../Events/Subscriptions/PollEndSubscription";
import { Poll } from "../Events/Poll";
import { PredictionEndSubscription } from "../Events/Subscriptions/PredictionEndSubscription";
import { Prediction } from "../Events/Prediction";
import { Cheer } from "../Events/Cheer";
import { CheerSubscription } from "../Events/Subscriptions/CheerSubscription";
import { Raid } from "../Events/Raid";
import { RaidSubscription } from "../Events/Subscriptions/RaidSubscription";
import { ChannelPointsCustomRewardRedemption } from "../Events/ChannelPointsCustomRewardRedemption";
import { ChannelPointsCustomRewardRedemptionAddSubscription } from "../Events/Subscriptions/ChannelPointsCustomRewardRedemptionAddSubscription";
import { BanSubscription } from "../Events/Subscriptions/BanSubscription";
import { Ban } from "../Events/Ban";

export class Streamer extends User {
    private tes: any;
    private bttv: BTTV;
    private livestream: LiveStream;

    constructor(userId: string, displayName?: string, refreshToken?: string) {
        super(userId, displayName, refreshToken);
        this.userId = userId;
        this.refreshToken = refreshToken;
        this.addProperty("a", new Resource("Streamer"));
    }

    protected onReady(): void {
        super.onReady();
        this.bttv = new BTTV(this.userId);
        this.checkLiveStream();
        this.connect();
    }

    public async connect() {
        const TES = require("tesjs");
        this.tes = new TES({
            identity: {
                id: process.env.TWITCH_CLIENT_ID,
                secret: process.env.TWITCH_CLIENT_SECRET,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                onAuthenticationFailure: async () => {
                    const accessToken = await this.refreshAccessToken();
                    return accessToken;
                },
            },
            listener: {
                type: "websocket",
            },
        });

        const subscriptions = await this.tes.getSubscriptions();
        for (const subscription of await subscriptions["data"]) {
            if (subscription.status === "websocket_disconnected") {
                await this.tes.unsubscribe(subscription.id);
            }
        }
        this.subscribeToAllEvents();
    }

    private async checkLiveStream() {
        const response = await fetch(
            `https://api.twitch.tv/helix/streams?user_id=${this.userId}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
        const data = await response.json();
        if (data.data.length > 0) {
            console.log(`${this.displayName} is live!`);
            this.livestream = new LiveStream(
                data.data[0].broadcaster_user_id,
                data.data[0].id,
                new Date(data.data[0].started_at)
            );
            this.livestream.semantize(this.resource);
        } else {
            console.log(`${this.displayName} is offline!`);
            this.livestream = null;
        }
    }

    public async subscribe(event: EventSubscription): Promise<any> {
        try {
            const sub = await this.tes.subscribe(
                event.type,
                event.condition,
                event.version
            );
            await this.tes.on(event.type, event.callback);
            console.log(`Subscribed to ${event.type} for ${this.displayName}`);
            return sub;
        } catch (e) {
            console.error(event.type, e);
        }
    }

    public async unsubscribe(subscription: any): Promise<void> {
        await this.tes.unsubscribe(subscription);
    }

    private subscribeToAllEvents() {
        this.subscribe(
            new StreamOnlineSubscription(this.userId, (data) => {
                this.livestream = new LiveStream(
                    this,
                    data.id,
                    new Date(data.started_at)
                );
                this.livestream.semantize(this.resource);
            })
        );
        this.subscribe(
            new StreamOfflineSubscription(this.userId, (data) => {
                this.livestream.finishStream();
                this.livestream.semantize(this.resource);
                this.livestream = null;
            })
        );

        this.subscribe(
            new SubscribeSubscription(this.userId, (data) => {
                new Subscribe(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new SubscriptionGiftSubscription(this.userId, (data) => {
                new SubscriptionGift(this.livestream, data).semantize(
                    this.resource
                );
            })
        );
        this.subscribe(
            new SubscriptionMessageSubscription(this.userId, (data) => {
                new SubscriptionMessage(this.livestream, data).semantize(
                    this.resource
                );
            })
        );
        this.subscribe(
            new HypeTrainEndSubscription(this.userId, (data) => {
                new HypeTrain(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new PollEndSubscription(this.userId, (data) => {
                new Poll(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new PredictionEndSubscription(this.userId, (data) => {
                new Prediction(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new MessageSubscription(this.userId, (data) => {
                new Message(this.livestream, data, this.bttv).semantize(
                    this.resource
                );
            })
        );
        this.subscribe(
            new CheerSubscription(this.userId, (data) => {
                new Cheer(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new RaidSubscription(this.userId, (data) => {
                new Raid(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new ChannelPointsCustomRewardRedemptionAddSubscription(
                this.userId,
                (data) => {
                    new ChannelPointsCustomRewardRedemption(
                        this.livestream,
                        data
                    ).semantize(this.resource);
                }
            )
        );
        this.subscribe(
            new FollowSubscription(this.userId, (data) => {
                new Follow(this.livestream, data).semantize(this.resource);
            })
        );
        this.subscribe(
            new BanSubscription(this.userId, (data) => {
                new Ban(this.livestream, data).semantize(this.resource);
            })
        );
    }
}
