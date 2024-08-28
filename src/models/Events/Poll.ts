import { RDFBase, Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { CommunityEvent } from "./CommunityEvent";
import { PollEndData } from "./Subscriptions/PollEndSubscription";

export class Poll extends CommunityEvent {
    constructor(triggeredOn: Streamer, data: PollEndData) {
        super({
            eventId: data.id,
            triggeredDuring: triggeredOn.livestream,
            hasStartedAt: new Date(data.started_at),
            hasEndedAt: new Date(data.ended_at),
            triggeredOn: triggeredOn,
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
            this.addProperty(new Resource("hasChoice"), newChoice.resource);

            this.addToSemantize(newChoice, triggeredOn.resource);
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
