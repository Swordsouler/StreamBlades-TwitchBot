import { EventSubscription } from "./EventSubscription";

export type ChannelPointsCustomRewardRedemptionAddData = {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    user_id: string;
    user_login: string;
    user_name: string;
    user_input: string;
    status: string;
    reward: {
        id: string;
        title: string;
        cost: number;
        prompt: string;
    };
    redeemed_at: string;
};
export class ChannelPointsCustomRewardRedemptionAddSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: ChannelPointsCustomRewardRedemptionAddData) => void
    ) {
        super(
            "channel.channel_points_custom_reward_redemption.add",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
