import { Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { CheerData } from "./Subscriptions/CheerSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class Cheer extends ViewerEvent {
    constructor(triggeredOn: Streamer, data: CheerData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("Cheer"));
        this.addProperty(
            new Resource("hasBits"),
            new XSDData(data.bits, "integer")
        );
        this.addProperty(
            new Resource("hasText"),
            new XSDData(data.message, "string")
        );
        this.addProperty(
            new Resource("isAnonymous"),
            new XSDData(data.is_anonymous, "boolean")
        );
    }
}
