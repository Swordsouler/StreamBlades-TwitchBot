import { Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscriptionGiftData } from "./Subscriptions/SubscriptionGiftSubscription";

export class SubscriptionGift extends Subscription {
    constructor(triggeredOn: Streamer, data: SubscriptionGiftData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("SubscriptionGift"));
        this.addProperty(
            new Resource("hasTotal"),
            new XSDData(data.total, "integer")
        );
        if (data.cumulative_total)
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
