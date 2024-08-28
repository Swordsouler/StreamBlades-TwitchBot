import { Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { RaidData } from "./Subscriptions/RaidSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class Raid extends ViewerEvent {
    constructor(triggeredOn: Streamer, data: RaidData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(
                data.from_broadcaster_user_id,
                data.from_broadcaster_user_name
            ),
            timestamp: undefined,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("Raid"));
        this.addProperty(
            new Resource("hasViewers"),
            new XSDData(data.viewers, "integer")
        );
    }
}
