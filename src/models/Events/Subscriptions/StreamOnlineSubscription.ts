import { EventSubscription } from "./EventSubscription";

export type StreamOnlineData = {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    type: "live" | "playlist" | "watch_party" | "premiere" | "rerun";
    started_at: string;
};
export class StreamOnlineSubscription extends EventSubscription {
    constructor(
        broadcasterId: string,
        callback: (data: StreamOnlineData) => void
    ) {
        super(
            "stream.online",
            {
                broadcaster_user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
