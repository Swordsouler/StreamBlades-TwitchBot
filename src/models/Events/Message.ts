import { ViewerEvent } from "./ViewerEvent";
import { Viewer } from "../Users/Viewer";
import { MessageData } from "./Subscriptions/MessageSubscription";
import { RDFBase, Resource, XSDData } from "../RDFBase";
import BTTV, { BTTVEmote } from "../Emote/BTTVEmote";
import { TwitchEmote } from "../Emote/TwitchEmote";
import { Streamer } from "../Users/Streamer";

export class Message extends ViewerEvent {
    constructor(triggeredOn: Streamer, data: MessageData, bttv: BTTV) {
        super({
            eventId: data.message_id,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(
                data.chatter_user_id,
                data.chatter_user_name
            ),
            timestamp: undefined,
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("Message"));
        this.addProperty(
            new Resource("hadMessageType"),
            new XSDData(data.message_type, "string")
        );
        this.addProperty(
            new Resource("hasText"),
            new XSDData(data.message.text, "string")
        );

        for (const b of data.badges) {
            const badge = new Badge(b.set_id);
            const hasBadge = new RDFBase(
                this.addProperty(new Resource("hasBadge"), badge.resource)
            );
            hasBadge.addProperty(
                new Resource("hasVersion"),
                new XSDData(b.id, "string")
            );

            this.addToSemantize(badge);
            this.addToSemantize(hasBadge, triggeredOn.resource);
        }

        bttv.findEmotes(data.message.text).forEach((bttvEmote: BTTVEmote) => {
            this.addProperty(new Resource("hasEmote"), bttvEmote.resource);
            this.addToSemantize(bttvEmote);
        });
        for (const fragment of data.message.fragments) {
            if (fragment.type === "emote" && fragment.emote) {
                const id = fragment.emote.id;
                const code = fragment.text;
                const twitchEmote = new TwitchEmote(id, code);
                this.addProperty(
                    new Resource("hasEmote"),
                    twitchEmote.resource
                );
                this.addToSemantize(twitchEmote);
            }
        }
    }
}

export class Badge extends RDFBase {
    constructor(set_id: string) {
        super(new Resource("badge_" + set_id));
        this.addProperty("a", new Resource("Badge"));
    }
}
