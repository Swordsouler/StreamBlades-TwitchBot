import { LiveStream } from "../LiveStream";
import { RDFBase, Resource, XSDData } from "../RDFBase";
import { CommunityEvent } from "./CommunityEvent";
import { PollEndData } from "./Subscriptions/PollEndSubscription";

export class Poll extends CommunityEvent {
    private choices: Choice[] = [];

    constructor(livestream: LiveStream, data: PollEndData) {
        super({
            eventId: data.id,
            triggeredDuring: livestream,
            hasStartedAt: new Date(data.started_at),
            hasEndedAt: new Date(data.ended_at),
        });
        this.addProperty("a", new Resource("Prediction"));
        this.addProperty(
            new Resource("hasTitle"),
            new XSDData(data.title, "string")
        );
        this.addProperty(
            new Resource("hasStatus"),
            new XSDData(data.status, "string")
        );
        for (const choice of data.choices) {
            const newChoice = new Choice(
                choice.id,
                choice.title,
                choice.bits_votes,
                choice.channel_points_votes,
                choice.votes
            );
            this.choices.push(newChoice);
            this.addProperty(new Resource("hasChoice"), newChoice.resource);
        }
    }

    public async semantize(
        context?: Resource,
        description?: string
    ): Promise<void> {
        if (!this.triggeredDuring) return;
        super.semantize(context, description);
        for (const choice of this.choices) {
            choice.semantize(context);
        }
    }
}

export class Choice extends RDFBase {
    constructor(
        id: string,
        title: string,
        bits_votes: number,
        channel_points_votes: number,
        votes: number
    ) {
        super(new Resource("choice_" + id));
        this.addProperty("a", new Resource("Choice"));
        this.addProperty(
            new Resource("hasTitle"),
            new XSDData(title, "string")
        );
        this.addProperty(
            new Resource("hasBitsVotes"),
            new XSDData(bits_votes, "integer")
        );
        this.addProperty(
            new Resource("hasChannelPointsVotes"),
            new XSDData(channel_points_votes, "integer")
        );
        this.addProperty(
            new Resource("hasVotes"),
            new XSDData(votes, "integer")
        );
    }
}
