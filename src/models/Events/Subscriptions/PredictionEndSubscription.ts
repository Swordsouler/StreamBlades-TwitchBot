import { EventSubscription } from "./EventSubscription";

export type PredictionEndData = {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    winning_outcome_id: string;
    outcomes: {
        id: string;
        title: string;
        color: string;
        users: number;
        channel_points: number;
        top_predictors: {
            user_id: string;
            user_login: string;
            user_name: string;
            channel_points_won: number;
            channel_points_used: number;
        }[];
    }[];
    status: "resolved" | "canceled";
    started_at: string;
    ended_at: string;
};
export class PredictionEndSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: PredictionEndData) => void
    ) {
        super(
            "channel.prediction.end",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
