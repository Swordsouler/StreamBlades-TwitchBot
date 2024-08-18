import { EventSubscription } from "./EventSubscription";

export type SubscriptionMessageData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    tier: string;
    message: {
        text: string;
        emotes: {
            begin: number;
            end: number;
            id: string;
        };
    };
    cumulative_months: number;
    streak_months: number;
    duration_months: number;
};
export class SubscriptionMessageSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: SubscriptionMessageData) => void
    ) {
        super(
            "channel.subscription.message",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
