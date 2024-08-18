import { LiveStream } from "../LiveStream";
import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { BanData } from "./Subscriptions/BanSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class Ban extends ViewerEvent {
    bannedBy: Viewer;

    constructor(livestream: LiveStream, data: BanData) {
        super({
            eventId: undefined,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: new Date(data.banned_at),
        });
        this.addProperty("a", new Resource("Ban"));
        this.addProperty(
            new Resource("hasReason"),
            new XSDData(data.reason, "string")
        );
        this.addProperty(
            new Resource("isPermanent"),
            new XSDData(data.is_permanent, "boolean")
        );
        this.bannedBy = new Viewer(
            data.moderator_user_id,
            data.moderator_user_name
        );
        this.addProperty(new Resource("bannedBy"), this.bannedBy.resource);
        if (!data.is_permanent && data.ends_at) {
            this.addProperty(
                new Resource("hasDuration"),
                new XSDData(
                    new Date(data.ends_at).getTime() -
                        new Date(data.banned_at).getTime(),
                    "integer"
                )
            );
        }
    }

    public async semantize(context?: Resource): Promise<void> {
        super.semantize(context);
        this.bannedBy.semantize();
    }
}
