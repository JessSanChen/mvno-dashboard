## Quickstart Guide

### `ngrok` Tunneling
Because you will need to expose your local server to the Internet, you will need to set up `ngrok` tunneling. See https://ngrok.com/download. Note down the forwarding address.

### TwiML
We use Twilio to take care of calls, texts, and automated messaging. If you haven't already, buy a phone number from Twilio and set up its webhook. Make sure to take your `ngrok` forwarding URL and configure your TwiML bin accordingly.

If you are using a free trial account, make sure to register each phone number with Twilio before attempting to call or text. Twilio requires this registration to prevent spam.

### Google Speech-to-Text SDK
Follow tutorials on https://cloud.google.com/sdk/docs/install-sdk to install and configure your Google Speech-to-Text SDK. 

### `.env` Authentications
Make sure you have keys/authentications for services. You can define either in a `.env` file or in CLI. Here is a non-exhaustive list.

`POSTGRES_URL`
`NEXTAUTH_URL` # https://localhost:3000
`AUTH_SECRET` # https://generate-secret.vercel.app/32
`AUTH_GITHUB_ID` # https://authjs.dev/getting-started/providers/github
`AUTH_GITHUB_SECRET` # https://authjs.dev/getting-started/providers/github
`OPENAI_API_KEY`
`POSTGRES_URL` # neon required
`TWILIO_ACCOUNT_SID`
`TWILIO_API_KEY`
`TWILIO_API_SECRET`
`GOOGLE_APPLICATION_CREDENTIALS`

## Testing Locally
Run the app using `npm dev`. Separately run the backend server with `npm start server.js`. Default port is 3000, so see app run in https://localhost:3000/dashboard. Call into your Twilio-provided phone number to access compliance and transcription services. Our Postgres server is hosted with Vercel.