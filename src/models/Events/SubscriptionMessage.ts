import { LiveStream } from "../LiveStream";
import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscriptionMessageData } from "./Subscriptions/SubscriptionMessageSubscription";

export class SubscriptionMessage extends Subscription {
    constructor(livestream: LiveStream, data: SubscriptionMessageData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
        });
        this.addProperty("a", new Resource("SubscriptionMessage"));
        this.addProperty(
            "hasStreakMonths",
            new XSDData(data.streak_months, "integer")
        );
        this.addProperty(
            "hasCumulativeMonths",
            new XSDData(data.cumulative_months, "integer")
        );
        this.addProperty(
            "hasDurationMonths",
            new XSDData(data.duration_months, "integer")
        );
        this.addProperty("hasText", new XSDData(data.message.text, "string"));
    }
}
