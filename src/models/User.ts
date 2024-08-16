export class User {
    protected id: string;
    protected username: string;
    protected displayName: string;

    constructor(id: string, username: string, displayName: string) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
    }
}

export class Streamer extends User {
    constructor(id: string, username: string, displayName: string) {
        super(id, username, displayName);
    }
}
