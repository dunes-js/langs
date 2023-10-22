import { js } from "../../src/index.js";
import { readFileSync } from "fs";

try {
  const source = readFileSync("test/js/source.js").toString("utf8");
  const result = js.interpret(source);
  console.log(result);

}
catch(err) {
	console.log("ERROR")
	console.log(err);
}

process.exit(0);