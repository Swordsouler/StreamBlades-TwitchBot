import { RDFBase, Resource, XSDData } from "../RDFBase";

export abstract class User extends RDFBase {
    public userId: string;
    public displayName: string;
    protected accessToken: string;
    protected refreshToken: string;
    protected get ready(): boolean {
        return !!this.accessToken;
    }

    constructor(userId: string, displayName?: string, refreshToken?: string) {
        super(new Resource("twitch_" + userId));
        this.userId = userId;
        this.displayName = displayName;
        this.refreshToken = refreshToken;
        const load = async () => {
            await this.refreshAccessToken();
            await this.loadDisplayName();
            this.onReady();
        };
        load();
    }

    protected onReady(): void {
        if (this.displayName)
            this.addProperty(
                new Resource("hasDisplayName"),
                new XSDData(this.displayName, "string")
            );
    }

    public async refreshAccessToken() {
        if (!this.refreshToken) return;

        const response = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
            }),
        });
        if (!response.ok) {
            const data = await response.json();
            console.error(
                `Failed to refresh access token for user ${this.userId}`,
                data
            );
            return;
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        setTimeout(this.refreshAccessToken, data.expires_in * 1000);
    }

    protected async loadDisplayName(): Promise<void> {
        if (this.displayName) return;
        if (!this.ready) {
            console.error(
                `Failed to load display name for user ${this.userId} because the user is not ready.`
            );
            return;
        }

        const response = await fetch(
            `https://api.twitch.tv/helix/users?id=${this.userId}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
        if (!response.ok) {
            const data = await response.json();
            console.error(
                `Failed to load display name for user ${this.userId}`,
                data
            );
            return;
        }
        const data = await response.json();
        this.displayName = data.data[0].display_name;
    }
}
