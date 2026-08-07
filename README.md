# Accuguide

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/accuguide/accuguide/biome.yml?logo=github&label=Biome)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/accuguide/accuguide/playwright.yml?logo=github&label=Playwright)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/accuguide/accuguide/github-code-scanning%2Fcodeql?label=CodeQL)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/accuguide/accuguide/build.yml?logo=github&label=Build)
![Netlify](https://img.shields.io/netlify/378e5089-548b-429f-b1ad-507f6bae73e4?logo=netlify&label=Netlify)

A platform designed by and for people with disabilities to find and rate accessible places and services.

## Table of Contents

## Table of Contents

* [Known Bugs](#known-bugs)
* [Beta Access](#beta-access)
* [Tech Stack](#tech-stack)
* [Contributing](#contributing)
* [Setup](#setup)
* [Sponsors](#sponsors)

## Known Bugs
- Email and password change submission form in user settings is unintuitive and does not always work.

## Beta Access

The open beta is available at **https://beta.accuguide.org**. If you already have an account on our main website, use those credentials to log in. The beta includes features and improvements not yet released to production.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, Tailwind CSS |
| Backend | PostgreSQL, Better Auth |
| Infrastructure | Google Cloud Platform (Auth, Maps API), AWS (Image Storage), Netlify |
| AI | Groq (groq/compound) |
| Testing | Cypress |
| Code Quality | CodeQL, Biome |

## Contributing

We are always looking for open source contributions! Check out our [contribution guidelines](https://github.com/accuguide/.github/blob/main/CONTRIBUTING.md) for more information. Once you are familiar with our guidelines, check out our issues to see what needs to be added, fixed, or changed. If you are new to GitHub, we recommend tackling issues labeled **"good first issue"**.

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/desktop/)
- [Bun](https://bun.sh/)

### Installation

1. `git clone https://github.com/accuguide/accuguide.git`
2. `bun install`
3. `cp .env.example .env`

### Optional Configuration

These steps are only required if you need the corresponding features to work locally.

| Feature | Steps |
|---|---|
| Search | Register a free [Google Maps API key](https://console.cloud.google.com/). Limit quotas (e.g. 10 req/min, 100 req/day). Add the key to both `GOOGLE_MAPS_API_KEY` fields in `.env`. |
| Google OAuth | In your Google Cloud project, configure the OAuth consent screen. Set Authorized JS origin to `http://localhost:3000` and redirect URI to `http://localhost:3000/login/google/callback`. Add the Client ID and Secret to `.env`. |
| AI Summaries | Register a free [Groq API key](https://console.groq.com/) and add it to the appropriate field in `.env`. |

> **Note:** Donation and email features are currently unavailable for local development due to complex setup requirements.

### Running the App

1. `bun dev`
2. `bun run s3:push`

For initial database setup or to reset the database:

- `bun db:push` — applies schema changes
- `bun db:seed` — resets to seed data

> **Tip:** If Docker has volume issues after the postgres:17 → postgres:18 upgrade, run `docker compose down -v`, stop all services, then run `bun dev` again.

## Sponsors

Please consider sponsoring Accuguide to ensure continued development and keep this project free and open source!

### Current Sponsors

No sponsors yet!
