import "dotenv/config";
import { Streamer } from "./models/Users/Streamer";
import { StreamBlades } from "./models/Users/ChatBot";
/*
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
);*/

/*console.log(RDF.toString());
console.log(RDF2.toString());*/

const Swordsouler = new Streamer(
    "107968853",
    "",
    "0do9olkmornqn8fjxlfdz66ri7vgad38rd49ejq5yrczw90ab1"
);

/*const CrocodyleTV = new Streamer(
    "101234264",
    "",
    "l7mat2qhfh0r588svs7xya1f530hr78qbtg463h90ofz45miax"
);*/
