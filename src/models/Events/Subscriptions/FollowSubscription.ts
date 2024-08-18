import { EventSubscription } from "./EventSubscription";

export type FollowData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    followed_at: string;
};
export class FollowSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: FollowData) => void) {
        super(
            "channel.follow",
            {
                broadcaster_user_id: broadcasterId,
                moderator_user_id: broadcasterId,
            },
            "2",
            callback
        );
    }
}
