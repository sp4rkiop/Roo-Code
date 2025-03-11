import * as vscode from "vscode"

import { RooCodeAPI } from "../../src/exports/roo-code"

import { waitFor } from "./utils"

const TIME_LIMIT = 300_000
const STALL_LIMIT = 60_000

export async function run() {
	const extension = vscode.extensions.getExtension<RooCodeAPI>("RooVeterinaryInc.roo-cline")

	if (!extension) {
		throw new Error("Extension not found.")
	}

	const api = extension.isActive ? extension.exports : await extension.activate()
	const provider = api.sidebarProvider
	await provider.updateGlobalState("apiProvider", "openrouter")
	await provider.updateGlobalState("openRouterModelId", "anthropic/claude-3.7-sonnet")
	await provider.updateGlobalState("autoApprovalEnabled", true)
	await provider.updateGlobalState("alwaysAllowReadOnly", true)
	await provider.updateGlobalState("alwaysAllowWrite", true)
	await provider.updateGlobalState("alwaysAllowExecute", true)
	await provider.updateGlobalState("alwaysAllowBrowser", true)
	await provider.updateGlobalState("alwaysApproveResubmit", true)
	await provider.updateGlobalState("alwaysAllowMcp", true)
	await provider.updateGlobalState("alwaysAllowModeSwitch", true)
	await provider.storeSecret("openRouterApiKey", process.env.OPENROUTER_API_KEY!)

	await vscode.workspace
		.getConfiguration("roo-cline")
		.update("allowedCommands", ["*"], vscode.ConfigurationTarget.Global)

	await vscode.commands.executeCommand("roo-cline.SidebarProvider.focus")
	await waitFor(() => provider.viewLaunched)

	await api.startNewTask(process.env.prompt!)

	let cursor = 0

	const startTime = Date.now()

	const getMessage = async () => {
		await waitFor(() => provider.messages.length > cursor, { timeout: STALL_LIMIT })
		return provider.messages[cursor++]
	}

	while (true) {
		try {
			const message = await getMessage()
			console.log("message = ", message)

			if (!message || message.say === "completion_result") {
				break
			}
		} catch (e) {
			console.error(e)
			break
		}

		if (Date.now() - startTime > TIME_LIMIT) {
			console.log("Time's up!")
			break
		}
	}

	console.log("🚀")
}
