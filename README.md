# netcentric.biz Relaunch
Relaunch of the [netcentric.biz](https://www.netcentric.biz) website.

## Environments
- Preview: https://main--netcentric--hlxsites.hlx.page/
- Live: https://main--netcentric--hlxsites.hlx.live/

## Installation

```sh
npm i
```

## Tests

```sh
npm tst
```

## Local development

1. Clone this repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Create .env file with the value: `HLX_PAGES_URL=https://<your-branch>--netcentric--hlxsites.hlx.page/` where <your-branch> is the branch you're using for development. This is a workaround for a helix issue with private repositories.
1. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `netcentric` directory in your favorite IDE and start coding :)
