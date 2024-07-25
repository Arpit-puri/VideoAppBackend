#It is a simple backend code for video Application.

## Installation Guide

### Requirements
- [Nodejs](https://nodejs.org/en/download)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

Both should be installed and make sure mongodb is running.

```shell
git clone https://github.com/Arpit-puri/CHIT-CHAT
cd chat-app-react-nodejs
```
Now construct .env file
```shell

cd src
mv .env.example .env
cd ..
```

Now install the dependencies
```shell
npm i
```
We are almost done, Now just start the development server.

For Backend.

Open another terminal in folder, Also make sure mongodb is running in background.
```shell
cd src
node index.js
```
