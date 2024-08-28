import { RDFBase, Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { CommunityEvent } from "./CommunityEvent";
import { PredictionEndData } from "./Subscriptions/PredictionEndSubscription";

export class Prediction extends CommunityEvent {
    constructor(triggeredOn: Streamer, data: PredictionEndData) {
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
        this.addProperty(
            new Resource("hasWinningOutcomeId"),
            new XSDData(data.winning_outcome_id, "string")
        );

        for (const outcome of data.outcomes) {
            const newOutcome = new Outcome(
                triggeredOn.resource,
                outcome.id,
                outcome.title,
                outcome.users,
                outcome.channel_points,
                outcome.top_predictors
            );
            this.addProperty(new Resource("hasOutcome"), newOutcome.resource);

            this.addToSemantize(newOutcome);
        }
    }
}

export class Outcome extends RDFBase {
    constructor(
        triggeredOn: Resource,
        id: string,
        title: string,
        users: number,
        channel_points: number,
        top_predictors: {
            user_id: string;
            user_login: string;
            user_name: string;
            channel_points_won: number;
            channel_points_used: number;
        }[]
    ) {
        super(new Resource("outcome_" + id), triggeredOn);
        this.addProperty("a", new Resource("Outcome"));
        this.addProperty(
            new Resource("hasTitle"),
            new XSDData(title, "string")
        );
        this.addProperty(
            new Resource("hasUsers"),
            new XSDData(users, "integer")
        );
        this.addProperty(
            new Resource("hasChannelPoints"),
            new XSDData(channel_points, "integer")
        );

        for (const topPredictor of top_predictors) {
            const predictor = new Viewer(
                topPredictor.user_id,
                topPredictor.user_name
            );
            const prediction = new RDFBase(
                this.addProperty(
                    new Resource("hasTopPredictor"),
                    predictor.resource
                )
            );
            prediction.addProperty(
                new Resource("hasChannelPointsWon"),
                new XSDData(topPredictor.channel_points_won, "integer")
            );
            prediction.addProperty(
                new Resource("hasChannelPointsUsed"),
                new XSDData(topPredictor.channel_points_used, "integer")
            );

            this.addToSemantize(predictor);
            this.addToSemantize(prediction, triggeredOn);
        }
    }
}
