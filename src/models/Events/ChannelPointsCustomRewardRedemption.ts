import { LiveStream } from "../LiveStream";
import { RDFBase, Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { ChannelPointsCustomRewardRedemptionAddData } from "./Subscriptions/ChannelPointsCustomRewardRedemptionAddSubscription";
import { ViewerEvent } from "./ViewerEvent";

export class ChannelPointsCustomRewardRedemption extends ViewerEvent {
    private reward: ChannelPointsReward;

    constructor(
        livestream: LiveStream,
        data: ChannelPointsCustomRewardRedemptionAddData
    ) {
        super({
            eventId: data.id,
            triggeredDuring: livestream,
            triggeredBy: new Viewer(data.user_id, data.user_name),
            timestamp: new Date(data.redeemed_at),
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
            new Resource(data.reward.id)
        );
        this.addProperty(
            new Resource("hasReward"),
            new Resource(data.reward.id)
        );
        this.reward = new ChannelPointsReward(
            data.reward.id,
            data.reward.title,
            data.reward.cost,
            data.reward.prompt
        );
    }

    public async semantize(context?: Resource): Promise<void> {
        if (!this.triggeredDuring) return;
        super.semantize(context);
        this.reward.semantize(context);
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
