import { LiveStream } from "../LiveStream";
import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscriptionGiftData } from "./Subscriptions/SubscriptionGiftSubscription";

export class SubscriptionGift extends Subscription {
    constructor(livestream: LiveStream, data: SubscriptionGiftData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
        });
        this.addProperty("a", new Resource("SubscriptionGift"));
        this.addProperty(
            new Resource("hasTotal"),
            new XSDData(data.total, "integer")
        );
        this.addProperty(
            new Resource("hasCumulativeTotal"),
            new XSDData(data.cumulative_total, "integer")
        );
        this.addProperty(
            new Resource("isAnonymous"),
            new XSDData(data.is_anonymous, "boolean")
        );
    }
}
