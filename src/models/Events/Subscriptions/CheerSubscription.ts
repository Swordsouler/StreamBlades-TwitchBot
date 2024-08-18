import { EventSubscription } from "./EventSubscription";

export type CheerData = {
    is_anonymous: string;
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    message: string;
    bits: number;
};
export class CheerSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: CheerData) => void) {
        super(
            "channel.cheer",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
