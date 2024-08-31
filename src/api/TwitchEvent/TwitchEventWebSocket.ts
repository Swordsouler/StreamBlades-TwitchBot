import WebSocket from "ws";

export class TwitchEventWebSocket {
    private sessionID: string = "";
    private ws: WebSocket | null = null;
    private connections: Record<
        string,
        {
            ws: WebSocket;
            subscriptions: Record<
                string,
                {
                    type: string;
                    condition: Record<string, any>;
                    callback: (data: any) => void;
                }
            >;
        }
    > = {};
    private readonly endpoint = "wss://eventsub.wss.twitch.tv/ws"; // Twitch WebSocket endpoint

    private accessToken: string;
    private refreshToken: string;
    private clientId: string;
    private clientSecret: string;
    private userId: string;
    private refreshTimeout: NodeJS.Timeout;

    private subscriptions: Record<
        string,
        {
            type: string;
            condition: Record<string, any>;
            callback: (data: any) => void;
        }
    > = {};

    // Constructor to initialize the class with the access token
    constructor(
        refreshToken: string,
        clientId: string,
        clientSecret: string,
        userId: string
    ) {
        this.refreshToken = refreshToken;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userId = userId;
    }

    public async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken) return "";

        const response = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            }),
        });
        if (!response.ok) {
            const data = await response.json();
            console.error(
                `Failed to refresh access token for user ${this.userId}`,
                data
            );
            return "";
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(
            this.refreshAccessToken,
            data.expires_in * 1000
        );
        return this.accessToken;
    }

    // Method to connect to the Twitch WebSocket
    private async connect() {
        await this.refreshAccessToken();

        this.ws = new WebSocket(this.endpoint);

        // Event listener for when the WebSocket connection is opened
        this.ws.on("open", () => {
            console.log("WebSocket connection established.");
        });

        // Event listener for incoming messages from the WebSocket
        this.ws.on("message", (data) => {
            this.handleMessage(data);
        });

        // Event listener for WebSocket errors
        this.ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

        // Event listener for when the WebSocket connection is closed
        this.ws.on("close", () => {
            console.log("WebSocket connection closed. Reconnecting...");
            // Automatically attempt to reconnect after a delay
            setTimeout(() => this.connect(), 5000);
        });
    }

    // Method to subscribe to an event type
    async subscribe(
        type: string,
        condition: Record<string, any>,
        version = "1",
        callback: (data: any) => void
    ) {
        const subscribeMessage = {
            type: type,
            version: version,
            condition: condition,
            transport: {
                method: "websocket",
                session_id: this.sessionID,
            },
        };

        const response = await fetch(
            "https://api.twitch.tv/helix/eventsub/subscriptions",
            {
                method: "POST",
                headers: {
                    "Client-ID": this.clientId,
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(subscribeMessage),
            }
        );

        const data = await response.json();

        if (data.data) {
            const subscription = data.data[0];
            this.subscriptions[subscription.id] = {
                type: subscription.type,
                condition: subscription.condition,
                callback: callback,
            };
        } else {
            console.error("Failed to subscribe to event:", data);
        }
    }

    // Method to handle incoming WebSocket messages
    private handleMessage(data: WebSocket.Data) {
        try {
            const {
                metadata: { message_type },
                payload,
            } = JSON.parse(data.toString());

            switch (message_type) {
                case "session_welcome":
                    const {
                        session: { id, keepalive_timeout_seconds },
                    } = payload;

                    break;
                case "response":
                    console.log("Received response:", payload);
                    // Handle the response payload here
                    break;
                default:
                    console.log("Unknown message type:", message_type);
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
    }
}
