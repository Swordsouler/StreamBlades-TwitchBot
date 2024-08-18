import { EventSubscription } from "./EventSubscription";

export type MessageData = {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    chatter_user_id: string;
    chatter_user_login: string;
    chatter_user_name: string;
    message_id: string;
    message: {
        text: string;
        fragments: {
            type: "text" | "cheeremote" | "emote" | "mention";
            text: string;
            cheermote?: {
                prefix: string;
                bits: number;
                tier: number;
            };
            emote?: {
                id: string;
                emote_set_id: string;
                owner_id: string;
                format: ("animated" | "static")[];
            };
            mention?: {
                user_id: string;
                user_name: string;
                user_login: string;
            };
        }[];
    };
    message_type: string;
    badges: {
        set_id: string;
        id: string;
        info: string;
    }[];
    cheer?: {
        bits: number;
    };
    color: string;
    reply?: {
        parent_message_id: string;
        parent_message_body: string;
        parent_user_id: string;
        parent_user_name: string;
        parent_user_login: string;
        thread_message_id: string;
        thead_user_id: string;
        thread_user_name: string;
        thread_user_login: string;
    };
    channel_points_custom_reward_id?: string;
    channel_points_animation_id?: string;
};
export class MessageSubscription extends EventSubscription {
    constructor(broadcasterId: string, callback: (data: MessageData) => void) {
        super(
            "channel.chat.message",
            {
                broadcaster_user_id: broadcasterId,
                user_id: broadcasterId,
            },
            "1",
            callback
        );
    }
}
