# Quiz App

Mobile quiz learning app built with Expo Router and React Native.

## Run Locally

```bash
pnpm install
pnpm start
```

Useful checks:

```bash
pnpm lint
```

## Project Structure

```txt
app/                  Expo Router screens
src/components/       Shared UI components
src/features/quiz/    Quiz API, types, and quiz-specific components
src/services/api/     API client setup
src/stores/           Zustand stores
docs/                 Project documentation, grouped by domain
```

## Documentation

Start here: [docs/README.md](docs/README.md)

Main groups:

- [Backend and API](docs/backend/README.md)
- [Frontend prompts and design](docs/frontend/app-ui-design-system-prompt.md)
- [AI features](docs/ai/)
- [Chat](docs/chat/)
- [Groups](docs/groups/)
- [Realtime](docs/realtime/)
- [Community](docs/community/)
- [Project summary](docs/project/PROJECT_SUMMARY.md)

Large merged/reference files are kept in [docs/archive/](docs/archive/).
