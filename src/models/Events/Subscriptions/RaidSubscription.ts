import { EventSubscription } from "./EventSubscription";

export type RaidData = {
    from_broadcaster_user_id: string;
    from_broadcaster_user_login: string;
    from_broadcaster_user_name: string;
    to_broadcaster_user_id: string;
    to_broadcaster_user_login: string;
    to_broadcaster_user_name: string;
    viewers: number;
};
export class RaidSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: RaidData) => void) {
        super(
            "channel.raid",
            {
                to_broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
