# Wedding RSVP
API to RSVP to wedding invitation.

Built with Express.js and Firebase Cloud Functions. Invitations are saved in Firebase Cloud Firestore.firebase
## Setting up
Setup instructions copied and adapted from [Firebase SDK for Cloud Functions Quickstart](https://github.com/firebase/functions-samples/tree/main/quickstarts/big-ben).
### 1. Clone this repo

Clone or download this repo.
### 2. Create a Firebase project and configure the quickstart

Create a Firebase Project on the [Firebase Console](https://console.firebase.google.com).

Set up your Firebase project by running `firebase use --add`, select your Project ID and follow the instructions.
### 3. Install the Firebase CLI

You need to have installed the Firebase CLI, and it always helps to be on the latest version. Run:

```bash
npm install -g firebase-tools
```

> Doesn't work? You may need to [change npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions).
## Try the sample locally

First you need to install the `npm` dependencies of the functions:

```bash
cd functions && npm install; cd ..
```

Start serving your project locally using `firebase serve`

Open the app in a browser at [http://localhost:5000/api/v1/invitations/](http://localhost:5000/api/v1/invitations/).
A page containing the response for the `GET invitations` endpoint will be displayed.
You can find all the endpoints at [ENDPOINTS.md](https://github.com/jorgeribeiro/wedding-rsvp/blob/main/ENDPOINTS.md/).
## Deploy the app to prod

First you need to install the `npm` dependencies of the functions:

```bash
cd functions && npm install; cd ..
```

This installs locally the Firebase SDK and the Firebase Functions SDK.

Deploy to Firebase using the following command:

```bash
firebase deploy
```

> The first time you call `firebase deploy` on a new project with Functions will take longer than usual.


## Try the sample on prod

After deploying the function you can open the following URL in your browser:

```
https://<your-project-id>.firebaseapp.com/api/v1/invitations
```

A page containing the response for the `GET invitations` endpoint will be displayed.