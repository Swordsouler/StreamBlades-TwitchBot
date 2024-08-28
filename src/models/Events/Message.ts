import { ViewerEvent } from "./ViewerEvent";
import { LiveStream } from "../LiveStream";
import { Viewer } from "../Users/Viewer";
import { MessageData } from "./Subscriptions/MessageSubscription";
import { RDFBase, Resource, XSDData } from "../RDFBase";
import BTTV, { BTTVEmote } from "../Emote/BTTVEmote";
import { Emote } from "../Emote/Emote";
import { TwitchEmote } from "../Emote/TwitchEmote";

export class Message extends ViewerEvent {
    private emotes: Record<string, Emote> = {};
    private badges: {
        badge: Badge;
        hasBadge: RDFBase;
    }[] = [];

    constructor(livestream: LiveStream, data: MessageData, bttv: BTTV) {
        super({
            eventId: data.message_id,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(
                data.chatter_user_id,
                data.chatter_user_name
            ),
            timestamp: undefined,
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
            this.badges.push({ badge, hasBadge });
        }

        bttv.findEmotes(data.message.text).forEach((emote: BTTVEmote) => {
            this.emotes[emote.id] = emote;
            this.addProperty(new Resource("hasEmote"), emote.resource);
        });
        for (const fragment of data.message.fragments) {
            if (fragment.type === "emote" && fragment.emote) {
                const id = fragment.emote.id;
                const code = fragment.text;
                if (!this.emotes[id]) {
                    const twitchEmote = new TwitchEmote(id, code);
                    this.emotes[fragment.emote.id] = twitchEmote;
                    this.addProperty(
                        new Resource("hasEmote"),
                        twitchEmote.resource
                    );
                }
            }
        }
    }

    public async semantize(
        context?: Resource,
        description?: string
    ): Promise<void> {
        if (!this.triggeredDuring) return;
        super.semantize(context, description);
        for (const emote of Object.values(this.emotes)) emote.semantize();
        for (const { badge, hasBadge } of this.badges) {
            badge.semantize();
            hasBadge.semantize(context);
        }
    }
}

export class Badge extends RDFBase {
    private set_id: string;
    constructor(set_id: string) {
        super(new Resource("badge_" + set_id));
        this.addProperty("a", new Resource("Badge"));
        this.set_id = set_id;
    }

    public async semantize(context?: Resource): Promise<void> {
        super.semantize(undefined, `Badge ${this.set_id}`);
    }
}
