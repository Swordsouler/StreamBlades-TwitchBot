import { LiveStream } from "../LiveStream";
import { Resource } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { FollowData } from "./Subscriptions/FollowSubscription";
import { ViewerEvent, ViewerEventProps } from "./ViewerEvent";

export class Follow extends ViewerEvent {
    constructor(livestream: LiveStream, data: FollowData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: new Date(data.followed_at),
        });
        this.addProperty("a", new Resource("Follow"));
    }
}
