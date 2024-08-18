import { EventSubscription } from "./EventSubscription";

export type SubscriptionGiftData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    total: number;
    tier: string;
    cumulative_total: number;
    is_anonymous: boolean;
};
export class SubscriptionGiftSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: SubscriptionGiftData) => void
    ) {
        super(
            "channel.subscription.gift",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
