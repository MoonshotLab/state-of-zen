# state-of-zen

Automatically tweet the status of the two Zen Rooms on the 4th floor of Barkley.

## How it Works
There's a Particle Photon attached to each light indicating whether or not each Zen Room is occupied. This script checks every minute or so to see if the Photon is powered. If so, the room is occupied. Any time the status of either room changes, we send a tweet to [https://twitter.com/CanIZen](@CanIZen).

## Setting up Keys
Set up the following environment variables: ```
  LEFT_ROOM_ID=''
  RIGHT_ROOM_ID=''
  PARTICLE_USER=''
  PARTICLE_PASS=''
  TWITTER_CONSUMER_KEY=''
  TWITTER_CONSUMER_SECRET=''
  TWITTER_ACCESS_TOKEN_KEY=''
  TWITTER_ACCESS_TOKEN_SECRET=''
```
