import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

import { build } from "gluegun"

async function main() {
	const cli = build()
		.brand("roo-code-benchmark-runner")
		.src(__dirname)
		.help()
		.version()
		.defaultCommand() // Use the default command if no args.
		.create()

	const { print, prompt } = await cli.run(process.argv)

	try {
		const exercisesPath = path.resolve(__dirname, "../../benchmark/exercises")

		if (!fs.existsSync(exercisesPath)) {
			print.error(`Error: Exercises directory not found at ${exercisesPath}`)
			process.exit(1)
		}

		const languages = fs
			.readdirSync(exercisesPath, { withFileTypes: true })
			.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
			.map((dir) => dir.name)

		if (languages.length === 0) {
			print.error("No language directories found in the exercises folder")
			process.exit(1)
		}

		const { selectedLanguage } = await prompt.ask({
			type: "select",
			name: "selectedLanguage",
			message: "Select a language:",
			choices: languages,
		})

		const languagePath = path.join(exercisesPath, selectedLanguage)

		if (!fs.existsSync(languagePath)) {
			print.error(`Error: Language directory not found at ${languagePath}`)
			process.exit(1)
		}

		const exercisesForLanguage = fs
			.readdirSync(languagePath, { withFileTypes: true })
			.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
			.map((dir) => dir.name)

		if (exercisesForLanguage.length === 0) {
			print.error(`No exercises found for ${selectedLanguage}`)
			process.exit(1)
		}

		const { selectedExercise } = await prompt.ask({
			type: "select",
			name: "selectedExercise",
			message: "Select an exercise:",
			choices: exercisesForLanguage,
		})

		const exercisePath = `exercises/${selectedLanguage}/${selectedExercise}`
		print.info(`Running ${exercisePath}...`)

		try {
			const benchmarkDir = path.resolve(__dirname, "../../benchmark")

			const spinner = print.spin("Building...")
			execSync("npm run build", { stdio: "inherit", cwd: benchmarkDir })
			spinner.succeed("Build completed")

			print.info(`Running exercise: ${exercisePath}`)
			const runCommand = `npm run benchmark -- -e ${exercisePath}`
			execSync(runCommand, { stdio: "inherit", cwd: benchmarkDir })
			process.exit(0)
		} catch (error) {
			print.error(error)
			process.exit(1)
		}
	} catch (error) {
		print.error(error)
		process.exit(1)
	}
}

main()
