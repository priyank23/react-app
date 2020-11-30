# react-app
This repo is my attempt in learning react-js by trying to create a web chat application using node-js and websockets in the background.

## Features
- Session based chats
- Channels are used to set up chat sessions
- Channels can be private or public based on the need of the creator a channel
- Broadcast messages enable us to message to all the channels and all the connected users simultaneously
- Images can also be sent as a message

## Technologies used
- Nodejs - Backend server app setup using express as a middleware
- Socket.io - Framework used to set up websockets
- Reactjs - Frontend design implementation

## How to run
- Clone this repo
- Open two terminals
- In one terminal, `cd api`, `npm install` , `npm start`
- In other terminal, `cd ui`, `npm install`, `npm start`
- Open a browser and go to `localhost:3000`
- You can go to the above URL from different tabs. Each tab will act as an individual user
