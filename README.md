# Digital Agent - TypeScript

## Requirements

```
Node >= 12.22.0
```

## Install deps

Please make sure you have the required packages. This app uses yarn and webpack. To install the dependencies, please run the following commands:

```
npm -g install yarn
npm -g install webpack
npm -g install webpack-cli
```

## Run

```shell
yarn install

# Build code to be fixed
yarn build

# Build a placeholder React app. The converted app and html page should use this.
yarn build_react

yarn start
```

## Tasks

1. Fix and validate the marked sections (**TODO:**) and compare it to the original JavaScript code.
1. Refactor the single web page to React.
1. Demonstrate that the TypeScript code works as the JavaScript code.
1. Refactor managing data structures based on best practices and not relying on cute, language dependent tricks and hacks.
1. Based on running and debugging the original JavaScript app or the TypeScript app, find out all data types and eliminate ‘any’ generic TypeScript data type.
1. Overall suggestions to refactor for a better design and getting better performance.

## Test

1. Click **Play** to play audio by Luke.
2. Click **Play Emote** to play a gesture.
