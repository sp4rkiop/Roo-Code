import * as path from "path"
import * as fs from "fs/promises"

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { runTests } from "@vscode/test-electron"

async function main() {
	// npm run build && npx dotenvx run -f .env.local -- node ./out/run.js -e exercises/javascript/binary
	const argv = await yargs(hideBin(process.argv))
		.option("exercise", {
			alias: "e",
			type: "string",
			description: "Path to the exercise directory",
			required: true,
		})
		.help().argv

	const extensionDevelopmentPath = path.resolve(__dirname, "../../")
	const extensionTestsPath = path.resolve(__dirname, "./runExercise")
	const testWorkspace = path.resolve(__dirname, "..", argv.exercise)
	const language = path.basename(path.dirname(testWorkspace))
	const prompt = await fs.readFile(path.resolve(__dirname, "..", `prompts/${language}.md`), "utf-8")

	await runTests({
		extensionDevelopmentPath: extensionDevelopmentPath,
		extensionTestsPath: extensionTestsPath,
		launchArgs: [testWorkspace, "--disable-extensions"],
		extensionTestsEnv: { prompt },
	})
}

main()
	.then(() => {
		console.log("👍")
	})
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
