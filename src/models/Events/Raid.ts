import { LiveStream } from "../LiveStream";
import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { RaidData } from "./Subscriptions/RaidSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class Raid extends ViewerEvent {
    constructor(livestream: LiveStream, data: RaidData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(
                data.from_broadcaster_user_id,
                data.from_broadcaster_user_name
            ),
            timestamp: undefined,
        });
        this.addProperty("a", new Resource("Raid"));
        this.addProperty(
            new Resource("hasViewers"),
            new XSDData(data.viewers, "integer")
        );
    }
}
