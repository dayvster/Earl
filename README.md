
# Earl Discord Bot

Earl is a feature-rich Discord bot written in TypeScript. It was originally created for a snowboarding Discord community, providing quick access to gear searches, weather, and fun utilities for riders. Over time, it has grown to include a variety of general-purpose and entertainment commands for any server.

It provides fun and useful commands for your server, including weather, Urban Dictionary, Google search, and more.

## Features

- **!google** — Returns the first result from a Google search
- **!weather** — Shows weather info for a location (e.g. `!weather imperial, New York, US`)
- **!urban** — Returns a definition for a word or phrase from Urban Dictionary
- **!userinfo** — Shows user information
- **!evo** — Search Evo.com for products
- **!bt** — Search Blue Tomato for snowboards
- **!help** — Lists available commands

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/Earl.git
   cd Earl
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   ```
3. **Configure your bot token:**
   - Copy your Discord bot token into a `.env` file:
     ```env
     DISCORD_TOKEN=your-bot-token-here
     ```
4. **Build and run:**
   ```sh
   pnpm build
   pnpm start
   ```
   Or, for development with TypeScript:
   ```sh
   pnpm ts-node Earl.ts
   ```

## Requirements
- Node.js 18+
- pnpm (or npm/yarn)
- A Discord bot token ([How to get one](https://discord.com/developers/applications))

## Project Structure

- `Earl.ts` — Main bot source code
- `.env` — Environment variables (not committed)
- `.gitignore` — Common ignores for Node/TypeScript
- `package.json` — Project metadata and dependencies
- `tsconfig.json` — TypeScript configuration

## License

MIT
