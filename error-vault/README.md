# Error Vault

Error Vault is a small VS Code extension plus Electron desktop app for saving errors and the fixes that solved them.

## What it does

- Saves terminal error text from your selected terminal output.
- Saves current VS Code diagnostics from the active file.
- Lets you paste or type an error manually.
- Stores every entry locally in a JSON file.
- Provides a desktop app where you can search errors and write the solution you used.

## Storage

Both apps use the same local database:

- Windows: `%APPDATA%\ErrorVault\errors.json`
- macOS: `~/Library/Application Support/ErrorVault/errors.json`
- Linux: `~/.config/ErrorVault/errors.json`

## Run the Desktop App

```bash
cd error-vault/desktop
npm install
npm start
```

## Run the VS Code Extension

```bash
cd error-vault/extension
npm install
npm run compile
```

Then open `error-vault/extension` in VS Code and press `F5` to launch an Extension Development Host.

## Extension Commands

Open the Command Palette and run:

- `Error Vault: Save Terminal Selection`
- `Error Vault: Save Error From Clipboard`
- `Error Vault: Save Current File Diagnostics`
- `Error Vault: Open Desktop App`

## Terminal Capture Note

VS Code extensions cannot reliably read arbitrary terminal history for privacy and platform reasons. Select the terminal error text first, then run `Error Vault: Save Terminal Selection`. The extension asks VS Code to copy the selection and saves that text.
