# TOP Transit Love · Director's Phone

A fictional interactive dating-show director simulator presented through a production team's smartphone. The player uses camera feeds, date planning, missions, anonymous messages, interviews, editing, and simulated fan communities to shape the broadcast.

> This is a fictional fan work set in a parallel universe. Its relationships, dialogue, and events are original game fiction and do not describe real people's private lives or establish real-world facts.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```powershell
npm ci
npm run dev
```

Use the local URL printed by Vite. To build and preview:

```powershell
npm run build
npm run preview
```

The static output is `dist/`. For Cloudflare Pages, choose the **None** framework preset, `npm run build`, and `dist`. Classic mode works without an API. AI Free Director mode requires a player-configured compatible API.

See [README.md](README.md) for the project layout and public-release asset notice. Code is licensed under [MIT](LICENSE); story text and images may have separate rights.
