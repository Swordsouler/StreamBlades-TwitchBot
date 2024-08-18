import { EventSubscription } from "./EventSubscription";

export type SubscribeData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    tier: string;
    is_gift: boolean;
};
export class SubscribeSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: SubscribeData) => void
    ) {
        super(
            "channel.subscribe",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
