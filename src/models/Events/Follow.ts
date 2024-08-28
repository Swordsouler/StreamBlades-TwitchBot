import { Resource } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { FollowData } from "./Subscriptions/FollowSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class Follow extends ViewerEvent {
    constructor(triggeredOn: Streamer, data: FollowData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: new Date(data.followed_at),
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("Follow"));
    }
}
