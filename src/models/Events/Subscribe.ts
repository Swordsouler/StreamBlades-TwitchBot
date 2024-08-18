import { LiveStream } from "../LiveStream";
import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscribeData } from "./Subscriptions/SubscribeSubscription";

export class Subscribe extends Subscription {
    constructor(livestream: LiveStream, data: SubscribeData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
        });
        this.addProperty("a", new Resource("Subscribe"));
        this.addProperty(
            new Resource("isGift"),
            new XSDData(data.is_gift, "boolean")
        );
    }
}
