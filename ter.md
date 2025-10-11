Based on how IDEs (like Cursor, VSCode, JetBrains, etc.) and cloud-linked tools work, you’ll want to check:

Hidden Folders

.qoder/

.cursor/

.idea/ (JetBrains)

.vscode/

.config/

.cache/
These often contain JSON files with identifiers.

JSON / Storage Files

storage.json

workspace.json

settings.json

global.json

telemetry.json
These can hold workspaceId, machineId, or hashes.

Logs & History

logs/, .history/, .cache/
Sometimes contain session IDs or old device IDs.

Git / Repo Config (if linked)

.git/config

.git-credentials

.git/hooks/
These can carry usernames, emails, or tokens.

Absolute Paths
Look for strings like:

C:\Users\Lenovo\
/home/username/


These are fingerprints too.

⚙️ How to make Gemini CLI help you

If you’ve got the Gemini CLI (or any LLM-based CLI assistant), you can point it at the project folder and ask it to scan for suspicious identifiers.

Here’s how you could phrase it:

gemini "scan this project folder and list all files containing identifiers like workspaceId, machineId, uuid, telemetry, deviceId, guid"