import { EventSubscription } from "./EventSubscription";

export type PollEndData = {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    choices: {
        id: string;
        title: string;
        bits_votes: number;
        channel_points_votes: number;
        votes: number;
    }[];
    bits_voting: {
        is_enabled: boolean;
        amount_per_vote: number;
    };
    channel_points_voting: {
        is_enabled: boolean;
        amount_per_vote: number;
    };
    status: "completed" | "archived" | "terminated";
    started_at: string;
    ended_at: string;
};
export class PollEndSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: PollEndData) => void) {
        super(
            "channel.poll.end",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
