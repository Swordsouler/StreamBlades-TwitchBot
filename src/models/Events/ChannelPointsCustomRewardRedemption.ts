import { LiveStream } from "../LiveStream";
import { RDFBase, Resource, XSDData } from "../RDFBase";
import { Streamer } from "../Users/Streamer";
import { Viewer } from "../Users/Viewer";
import { ChannelPointsCustomRewardRedemptionAddData } from "./Subscriptions/ChannelPointsCustomRewardRedemptionAddSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class ChannelPointsCustomRewardRedemption extends ViewerEvent {
    private reward: ChannelPointsReward;

    constructor(
        triggeredOn: Streamer,
        data: ChannelPointsCustomRewardRedemptionAddData
    ) {
        super({
            eventId: data.id,
            triggeredDuring: triggeredOn.livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: new Date(data.redeemed_at),
            triggeredOn: triggeredOn,
        });
        this.addProperty(
            "a",
            new Resource("ChannelPointsCustomRewardRedemption")
        );
        this.addProperty(
            new Resource("hasStatus"),
            new XSDData(data.status, "string")
        );
        this.addProperty(
            new Resource("hasUserInput"),
            new XSDData(data.user_input, "string")
        );
        this.reward = new ChannelPointsReward(
            data.reward.id,
            data.reward.title,
            data.reward.cost,
            data.reward.prompt
        );
        this.addProperty(new Resource("hasReward"), this.reward.resource);

        this.addToSemantize(this.reward, triggeredOn.resource);
    }
}

export class ChannelPointsReward extends RDFBase {
    constructor(id: string, title: string, cost: number, prompt: string) {
        super(new Resource("reward_" + id));
        this.addProperty("a", new Resource("ChannelPointsReward"));
        this.addProperty(
            new Resource("hasTitle"),
            new XSDData(title, "string")
        );
        this.addProperty(new Resource("hasCost"), new XSDData(cost, "integer"));
        this.addProperty(
            new Resource("hasPrompt"),
            new XSDData(prompt, "string")
        );
    }
}
