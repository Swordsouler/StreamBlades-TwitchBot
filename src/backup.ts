import "dotenv/config";
import Stardog, { Connection, query } from "stardog";

export class Backup {
    private static connection = new Connection({
        username: process.env.STARDOG_USERNAME,
        password: process.env.STARDOG_PASSWORD,
        endpoint: process.env.STARDOG_ENDPOINT,
    });

    public static async query(queryString: string): Promise<Stardog.HTTP.Body> {
        console.log("Querying Stardog...");
        const result = await query.execute(
            Backup.connection,
            process.env.STARDOG_DATABASE,
            queryString
        );
        console.log(result);
        if (result.status !== 200) throw result;
        return result.body;
    }
}

console.log({
    username: process.env.STARDOG_USERNAME,
    password: process.env.STARDOG_PASSWORD,
    endpoint: process.env.STARDOG_ENDPOINT,
});

const queryString =
    "CONSTRUCT { GRAPH ?g { ?s ?p ?o } } WHERE { GRAPH ?g { ?s ?p ?o } } LIMIT 1000000";
Backup.query(queryString).then((result) => {
    console.log(result);
    // write into a file
    const fs = require("fs");
    const path = require("path");

    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const fileName = path.join(
        backupDir,
        // Date format YYYY-MM-DD_HH-MM-SS
        `backup_${new Date().toISOString().replace(/:/g, "-").slice(0, 19)}.ttl`
    );
    fs.writeFile(fileName, result, (err: any) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log(`Backup saved to ${fileName}`);
        }
    });
});
