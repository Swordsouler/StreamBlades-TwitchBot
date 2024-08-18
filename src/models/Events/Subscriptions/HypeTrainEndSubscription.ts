import { EventSubscription } from "./EventSubscription";

export type HypeTrainEndData = {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    level: number;
    total: number;
    top_contributions: {
        user_id: string;
        user_login: string;
        user_name: string;
        type: "bits" | "subscription" | "other";
        total: number;
    }[];
    started_at: string;
    ended_at: string;
    cooldown_ends_at: string;
};
export class HypeTrainEndSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: HypeTrainEndData) => void
    ) {
        super(
            "channel.hype_train.end",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
