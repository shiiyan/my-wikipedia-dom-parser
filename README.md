# Wikipedia Keyword Tree Generator

This is a simple application to generate a nested keyword tree for any given keyword of Wikipedia.

Notice:
I build this application mainly for Wikipedia page in Japanese, which has URL like `ja.wikipedia.org/`. English page may not work properly.

## Requirements

I am using these tools to develop this app. Different tools or versions may not working.

- Chrome 93.0.4577.82
- Node.js v16.6.1
- npm 7.20.3
- zsh 5.8
- GNU Make 3.81

## Build

If you can run make command, then run next command to start dev environment.

```zsh
make dev
```

If you can't run make command, then run the following commands.

1. Install required packages for CORS proxy server.

```
cd backend
npm install
```

2. Start CORS proxy server

```
## Under backend directory
node index.js
```

3. Open main page in defualt browser

```
cd .. ## Back to root directory
open index.html
```
