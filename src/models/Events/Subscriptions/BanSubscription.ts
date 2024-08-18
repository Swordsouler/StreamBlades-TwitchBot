import { EventSubscription } from "./EventSubscription";

export type BanData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    moderator_user_id: string;
    moderator_user_login: string;
    moderator_user_name: string;
    reason: string;
    banned_at: string;
    ends_at: string;
    is_permanent: boolean;
};
export class BanSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: BanData) => void) {
        super(
            "channel.ban",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
