import { js } from "../src/index.js";
import { readFileSync } from "fs";

const loadStart = Date.now();
const jsParser = new js.Parser();
const jsInterpreter = new js.Interpreter();
const loadTime = Date.now() - loadStart;

try {
  const parseStart = Date.now();
  const source = readFileSync("test/source.js").toString("utf8");
	const ast = jsParser.produce(source);
  const parseTime = Date.now() - parseStart;
  const interpretStart = Date.now();
  const result = jsInterpreter.interpret(ast);
  const interpretTime = Date.now() - interpretStart;
  console.log(result);
  console.log();
  console.log("Loaded in", loadTime + "ms");
  console.log("Parsed in", parseTime + "ms");
  console.log("Interpreted in", interpretTime + "ms");

}
catch(err) {
	console.log("ERROR")
	console.log(err);
}

process.exit(0);