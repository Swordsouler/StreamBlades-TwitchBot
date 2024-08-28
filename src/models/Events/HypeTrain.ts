import { RDFBase, Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { CommunityEvent } from "./CommunityEvent";
import { HypeTrainEndData } from "./Subscriptions/HypeTrainEndSubscription";

export class HypeTrain extends CommunityEvent {
    topContributions: {
        contributor: Viewer;
        contribution: RDFBase;
    }[] = [];

    constructor(triggeredOn: Streamer, data: HypeTrainEndData) {
        super({
            eventId: data.id,
            triggeredDuring: triggeredOn.livestream,
            hasStartedAt: new Date(data.started_at),
            hasEndedAt: new Date(data.ended_at),
            triggeredOn: triggeredOn,
        });
        this.addProperty("a", new Resource("HypeTrain"));
        this.addProperty(
            new Resource("hasLevel"),
            new XSDData(data.level, "integer")
        );
        this.addProperty(
            new Resource("hasTotal"),
            new XSDData(data.total, "integer")
        );
        for (const contribution of data.top_contributions) {
            const topContributor = new Viewer(
                contribution.user_id,
                contribution.user_name
            );
            const topContribution = new RDFBase(
                this.addProperty(
                    new Resource("hasTopContributor"),
                    topContributor.resource
                )
            );
            topContribution.addProperty(
                new Resource("hasType"),
                new XSDData(contribution.type, "string")
            );
            topContribution.addProperty(
                new Resource("hasTotal"),
                new XSDData(contribution.total, "integer")
            );
            this.topContributions.push({
                contributor: topContributor,
                contribution: topContribution,
            });
            this.addToSemantize(topContributor);
            this.addToSemantize(topContribution, triggeredOn.resource);
        }
    }
}
