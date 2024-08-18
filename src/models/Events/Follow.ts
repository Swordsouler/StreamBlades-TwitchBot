import { v4 as uuidv4 } from "uuid";
import { Resource } from "../RDFBase";
import { EventSubscription } from "./TwitchEvent";
import { ViewerEvent, ViewerEventProps } from "./ViewerEvent";
import { LiveStream } from "../LiveStream";
import { Viewer } from "../Users/Viewer";

type FollowData = {
    user_id: string;
    user_login: string;
    user_name: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    followed_at: string;
};
export class FollowSubscription extends EventSubscription {
    constructor(broadcasterId: string) {
        super(
            "channel.follow",
            {
                broadcaster_user_id: broadcasterId,
                moderator_user_id: broadcasterId,
            },
            "2"
        );
    }

    public callback(data: FollowData): void {
        console.log(data);
        const follow = new Follow({
            // deduce livestream
            triggeredDuring: new LiveStream("stream1"),
            triggeredBy: new Viewer(data.user_id, data.user_name),
        });
        follow.semantize();
    }
}

export type FollowProps = ViewerEventProps & {};
export class Follow extends ViewerEvent {
    constructor(props: FollowProps) {
        const { ...viewerEventProps } = props;
        super(viewerEventProps);
    }
}
