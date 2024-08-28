import { Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { Subscription } from "./Subscription";
import { SubscriptionMessageData } from "./Subscriptions/SubscriptionMessageSubscription";

export class SubscriptionMessage extends Subscription {
    constructor(triggeredOn: Streamer, data: SubscriptionMessageData) {
        super({
            eventId: undefined,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: undefined,
            hasTier: data.tier,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("SubscriptionMessage"));
        this.addProperty(
            new Resource("hasStreakMonths"),
            new XSDData(data.streak_months, "integer")
        );
        this.addProperty(
            new Resource("hasCumulativeMonths"),
            new XSDData(data.cumulative_months, "integer")
        );
        this.addProperty(
            new Resource("hasDurationMonths"),
            new XSDData(data.duration_months, "integer")
        );
        this.addProperty(
            new Resource("hasText"),
            new XSDData(data.message.text, "string")
        );
    }
}
