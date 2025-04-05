# Me and NGROK

The package [ngrok](https://www.npmjs.com/package/ngrok) allows us to provide easy public access to our service.

So here goes the story...

Host static directory using `python -m http.module 7000`.

Add html to it...

Show that I can quickly modify html and make it publically available...

Add some vanilla javascript that alerts...

Add post request to store the data... Ooops, we can't, we need service. I know how to make service using javascript, let me do it.

Oops, that's a CORS request, won't work... Oh, yes, let's proxy requests... Let's use NGINX...

Ok... Let's use Docker, NGINX is not available on Windows.

Nice... NGINX doesn't work... What now?

Figure it out... OK, nginx works, what now? Oops, requests are still CORS, but even worse, the public https service sends request to localhost. Oh no. What a mess...

Then... Ok, let's use docker-compose. But wait... I removed CORS headers... It still doesn't work...

Oh, right! To send request within a container, i have to send request to `http://{service_name}:{PORT}`. Wow, it works. `http://api:7000` works.

Ok... Now I have...

JSON in memory database.

Proxying between two services.

Send request to local server to /api and proxy it to another service.

Handle request in API and resolve it.

But wait, we do not need docker compose for that. We don't need an API either. Why do we have them? Why so complicated?

Simple. Initially I had Python static serving. Then added javascript proxy API. I thought python and javascript api communicate locally.

Publically exposed service won't have trouble communicating. It turned out that, python statically hosted files, which sent request to my localhost.

Oopsie woopsie doopsie.

## How to run

Make available publically (optional):

```
npx ngrok 7000
```

Build and run:

```
docker compose build
docker compose up
```

Then, press `w` to activate docker-compose watch mode. You need this mode, docker-compose will restart service on code changes.

Open [the server](http://localhost:7000)

## How to format

I use `npx prettier --write .` from the root... Each module has its own `package.json` so they should be indepent repositories. But at this moment i'm just trying to get a working app... and use ai...

## Disclaimer

This code is highly AI generated LOL! Actually i barely wrote code myself, i mostly copy pasted and prompted for the errors, solutions, and code that does what i want it to.

OF COURSE, I HAVE READ THE CODE BEFORE COPY PASTING IT, BECAUSE I CAN UNDERSTAND IT.

NOW GO AWAY. I'M SURPRISED YOU EVEN FOUND THIS REPO. SHHH. SHHH. SHHH.
