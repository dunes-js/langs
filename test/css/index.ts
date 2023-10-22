import { css } from "../../src/index.js";
import { readFileSync } from "fs";

try {
  const source = readFileSync("test/css/source.css").toString("utf8");

  const result = css.parse(source);
  console.log(result);

}
catch(err) {
	console.log("ERROR")
	console.log(err);
}

process.exit(0);