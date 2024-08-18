import { EventSubscription } from "./EventSubscription";

export type StreamOfflineData = {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
};
export class StreamOfflineSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: StreamOfflineData) => void
    ) {
        super(
            "stream.offline",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
