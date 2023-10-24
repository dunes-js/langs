import { xml } from "../../src/index.js";
import { readFileSync } from "fs";
import { js } from "@dunes/tools";

try {
  const source = readFileSync("test/xml/source.xml").toString("utf8");

  const result = xml.parse(source);
  console.log(js(result.program));

}
catch(err) {
	console.log("ERROR")
	console.log(err);
}

process.exit(0);