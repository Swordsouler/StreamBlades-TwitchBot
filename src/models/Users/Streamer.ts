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
import { TES } from "../../api/TwitchEvent/tes";

export class Streamer extends User {
    private tes: TES;
    private bttv: BTTV;
    public livestream: LiveStream;

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
        try {
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
                options: {
                    debug: false,
                    logging: false,
                },
            });
        } catch (e) {
            console.error(e);
        }

        const subscriptions = await this.tes.getSubscriptions();
        for (const subscription of await subscriptions["data"]) {
            if (
                subscription.status === "websocket_disconnected" ||
                subscription.status === "websocket_failed_ping_pong"
            ) {
                await this.tes.unsubscribe(subscription.id);
                console.log(
                    "Unsubscribed from",
                    subscription.type,
                    "for",
                    this.displayName
                );
            }
        }
        this.subscribeToAllEvents();
        setTimeout(async () => {
            const subscriptions = await this.tes.getSubscriptions();
            console.log(
                this.displayName,
                "is subscribed to",
                subscriptions.total,
                "events"
            );
        }, 10000);
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
                this,
                data.data[0].id,
                new Date(data.data[0].started_at)
            );
            this.livestream.semantize(`stream.online from ${this.displayName}`);
        } else {
            console.log(`${this.displayName} is offline!`);
            this.livestream = null;
        }
    }

    public async subscribe(
        event: EventSubscription
        //retry: boolean = true
    ): Promise<any> {
        try {
            const sub = await this.tes.subscribe(
                event.type,
                event.condition,
                event.version
            );
            this.tes.on(event.type, event.callback);
            console.log(`Subscribed to ${event.type} for ${this.displayName}`);
            return sub;
        } catch (e) {
            console.error(this.userId, `(${this.displayName})`, event.type, e);
            /*if (
                retry &&
                e.message ===
                    "429 Too Many Requests: number of websocket transports limit exceeded"
            )
                setTimeout(async () => {
                    console.log("Retrying to subscribe to " + event.type);
                    await this.subscribe(event, false);
                }, 65000);*/
        }
    }

    public async unsubscribe(subscription: any): Promise<void> {
        await this.tes.unsubscribe(subscription);
    }

    private eventsSubscriptions: Record<string, EventSubscription> = {
        "stream.online": new StreamOnlineSubscription(this.userId, (data) => {
            this.livestream = new LiveStream(
                this,
                data.id,
                new Date(data.started_at)
            );
            this.livestream.semantize(
                `stream.online from ${data.broadcaster_user_name}`
            );
        }),
        "stream.offline": new StreamOfflineSubscription(this.userId, (data) => {
            this.livestream.finishStream();
            this.livestream.semantize(
                `stream.offline from ${data.broadcaster_user_name}`
            );
            this.livestream = null;
        }),
        "channel.subscribe": new SubscribeSubscription(this.userId, (data) => {
            new Subscribe(this, data).semantize(
                `channel.subscribe from ${data.user_name} to ${data.broadcaster_user_name}}`
            );
        }),
        "channel.subscription.gift": new SubscriptionGiftSubscription(
            this.userId,
            (data) => {
                new SubscriptionGift(this, data).semantize(
                    `channel.subscription.gift ${data.total} gifts from ${data.user_name} to ${data.broadcaster_user_name}`
                );
            }
        ),
        "channel.subscription.message": new SubscriptionMessageSubscription(
            this.userId,
            (data) => {
                new SubscriptionMessage(this, data).semantize(
                    `channel.subscription.message from ${data.user_name} to ${data.broadcaster_user_name}`
                );
            }
        ),
        "channel.hype_train.end": new HypeTrainEndSubscription(
            this.userId,
            (data) => {
                new HypeTrain(this, data).semantize(
                    `channel.hype_train.end ${data.level} levels from ${data.broadcaster_user_name}`
                );
            }
        ),
        "channel.poll.end": new PollEndSubscription(this.userId, (data) => {
            new Poll(this, data).semantize(
                `channel.poll.end from ${data.broadcaster_user_name}`
            );
        }),
        "channel.prediction.end": new PredictionEndSubscription(
            this.userId,
            (data) => {
                new Prediction(this, data).semantize(
                    `channel.prediction.end from ${data.broadcaster_user_name}`
                );
            }
        ),
        "channel.chat.message": new MessageSubscription(this.userId, (data) => {
            new Message(this, data, this.bttv).semantize(
                `channel.chat.message from ${data.chatter_user_name} to ${data.broadcaster_user_name}`
            );
        }),
        "channel.cheer": new CheerSubscription(this.userId, (data) => {
            new Cheer(this, data).semantize(
                `channel.cheer ${data.bits} bits from ${data.user_name} to ${data.broadcaster_user_name}`
            );
        }),
        "channel.raid": new RaidSubscription(this.userId, (data) => {
            new Raid(this, data).semantize(
                `channel.raid ${data.viewers} viewers from ${data.from_broadcaster_user_name} to ${data.to_broadcaster_user_name}`
            );
        }),
        "channel.channel_points_custom_reward_redemption.add":
            new ChannelPointsCustomRewardRedemptionAddSubscription(
                this.userId,
                (data) => {
                    new ChannelPointsCustomRewardRedemption(
                        this,
                        data
                    ).semantize(
                        `channel.channel_points_custom_reward_redemption.add ${data.reward.title} from ${data.user_name} to ${data.broadcaster_user_name}`
                    );
                }
            ),
        "channel.follow": new FollowSubscription(this.userId, (data) => {
            new Follow(this, data).semantize(
                `channel.follow from ${data.user_name} to ${data.broadcaster_user_name}`
            );
        }),
        "channel.ban": new BanSubscription(this.userId, (data) => {
            new Ban(this, data).semantize(
                `channel.ban ${data.user_name} from ${data.moderator_user_name} on ${data.broadcaster_user_name}`
            );
        }),
    };

    private subscribeToAllEvents() {
        const events = Object.keys(this.eventsSubscriptions);
        events.forEach((event, index) => {
            setTimeout(() => {
                this.subscribe(this.eventsSubscriptions[event]);
            }, index * 200);
        });

        /*setInterval(() => {
            // trigger a random event
            const events = Object.keys(this.eventsSubscriptions);
            const randomEvent =
                events[Math.floor(Math.random() * events.length)];
            // if not stream.online or stream.offline
            if (
                randomEvent !== "stream.online" &&
                randomEvent !== "stream.offline"
            )
                this.eventsSubscriptions[randomEvent].triggerRandomEvent();
        }, 1000);*/

        /*if (this.userId !== "107968853") return;
        this.eventsSubscriptions["stream.online"].triggerRandomEvent();
        setTimeout(() => {
            this.eventsSubscriptions["stream.offline"].triggerRandomEvent();
        }, 30000);*/
    }

    public async stop() {
        await this.tes.disconnect();
        clearTimeout(this.refreshTimeout);
        console.log(`Disconnected from ${this.displayName}`);
    }
}
