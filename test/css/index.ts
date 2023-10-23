import { css } from "../../src/index.js";
import { readFileSync } from "fs";
import { js } from "@dunes/tools";

try {
  const source = readFileSync("test/css/source.css").toString("utf8");

  const result = css.parse(source);
  console.log(js(result.program));

}
catch(err) {
	console.log("ERROR")
	console.log(err);
}

process.exit(0);