import { Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscribeData } from "./Subscriptions/SubscribeSubscription";

export class Subscribe extends Subscription {
    constructor(triggeredOn: Streamer, data: SubscribeData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("Subscribe"));
        this.addProperty(
            new Resource("isGift"),
            new XSDData(data.is_gift, "boolean")
        );
    }
}
