import "dotenv/config";
import { RDFBase, Resource, Triple, XSDData } from "./models/RDFBase";

const RDF = new RDFBase(new Resource("10791592"));
RDF.addProperty(new Resource("hasBadge"), new Resource("Moderator"));
RDF.addProperty(new Resource("hasBadge"), new Resource("Streamer"));
RDF.addProperty(new Resource("hasBadge"), new Resource("VS"));
RDF.addProperty(new Resource("hasName"), new XSDData("Swordsouler", "string"));

const RDF2 = new RDFBase(new Triple("10791592", "hasBadge", "VS"));
RDF2.addProperty(
    new Resource("hasTime"),
    new XSDData("2021-09-01T00:00:00Z", "dateTime")
);
RDF2.addProperty(
    new Resource("hasTime"),
    new XSDData("2021-09-01T00:00:00Z", "dateTime")
);

console.log(RDF.toString());
console.log(RDF2.toString());
