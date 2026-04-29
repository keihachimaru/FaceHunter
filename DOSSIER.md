# FaceHunter

## Description

FaceHunter is a social videgame that combines real life aspects to create a bridge between physical traditional games and modern dopamine-driven games. FaceHunter has 2 modes and a module that adds cohesion to each of these modes.

- Face Mode: This mode would be  the virtual equivalent to hide and seek. Although having different variations, the core system is simple: try to take photos of the faces of other peoples. The game, using CV (Computer Vision) will validate these photos and do the necessary calculations.

- Hunter Mode: This mode is more like a modern shooter, it allows for all game variations you can see in popular FPS (First Person Shooters) like Valorant or CS:GO. Here, the camera acts as the in-game camera in these FPS and you shoot like you would in any of these FPS. The game will use a mix of CV and bluetooth triangulation to calculate and validate the shots.

The cohesion module would be the social aspect. Games that involve interaction are social by nature. Adding ways and tools to encourage interactions like leaderboards, highlights posting or connections with friends would enrich and add that social aspect that would provide cohesion to these games. 

In the following sections I will discuss the features more deeply, techinical aspects and legal considerations.

## Features and functionalities

### Authentication

User can authenticate using their Google accounts to remove friction. One single click and users can login. Upon the creation of account there will be an option to be a free trial user, or a paid user. Payments will be handled using Stripe. [1]

#### Free trial user vs Premium user

Free trial users have a limited but generous acces to the functionalities of the game, in order to let them test and see how the game is for them. The main difference is that they do NOT have acces to the social aspect of the game due to legal reasons. [2]

Premium users have all access to all aspects, custom designs and banners, and of course the social module of the game. The pricing will follow a subscription model.

### Face Gamemodes

The face gamemode will use a CV engine to determine which target appears in the photo and to validate the quality of the taken photo.

#### Classic mode

Free trial users will have to take a photo of themselves for each new game due to image storage legal limitations. [3]. Once every user has joined the game, they will have to each one click a "I'm ready" button in order for the game to start. There will be **3 rounds** of maximum **2 minutes** (subject to change) [4]. A round will finish either when the time limit is up or there is only one person left. In order to eliminate other players you have to take a not blurred photo of their face, having the face in the center of the photo. Once the game has concluded a leaderboard appears, and an option to view every valid photo taken during the game. Free trial users can share the photos [5] in the social media of their choice. Premium users also have the option to upload it to they FaceHunter social media. 

### Hunter Gamemodes

*Still to be determined if hunter mode is sufficently accurate*

### Social media

For the Face gamemodes users will have the option to share the taken photos in their social media of choice, and premium users will have the possibility to share photos of each other in the FaceHunter social media app. The appeal of sharing photos in the FaceHunter social media is the ability to view the stats of the game in which the photo was taken, other photos taken by the same person, and any relevant stats that the app might be able to pick up.

People can only post photos where other premium users appear, in order to comply with the privacy and data laws, and to prevent the upload of photos of minors. Other users will be able to upvote or downvote the photo, and view the stats and context of the game in which the photo was taken.

Only premium users are able to access this feature.

### Friends

The ability to chat with friends will be available for everyone. It will be a basic chat and will provide the following options:

- Basic messaging (text only)
- Custom FaceHunter stickers
- Game invite links (in order to invite friends and let them quick join)

### Security measures

In order to prevent abuse or any malicious behaviour, users will be able to report other users. This will create a tick that will be reviewd by a human moderator and will create an appropiate punishment.

### Profile customization

Users will be able to change the following fields regarding their profile:

- Display name
- Profile picture (avatar upload / generated avatar)
- Bio / description
- Profile banner / header image
- Profile theme
- Badges / achievements display
- Level / XP display (game progression)
- Status (online / away / custom status)
- Privacy level (public / friends / private)
- Emotes / reactions pack selection

### Settings

Users will be able to change the following fields and perform the following actions:

#### Account

- Change email 
- Change password
- Connected accounts (Google, Apple, etc.)
- Delete account
- Logout

#### Privacy & Security

- Private account toggle
- Blocked users list

#### Notifications

- Push notifications toggle
- Likes / comments notifications 
- Messages notifications
- Game events notifications
- Friend requests / social invites
- Email notifications toggle

#### Content & Social

- Comment visibility controls
- Who can message you (everyone / friends / none)
- Tagging permissions
- Feed preferences (following / algorithm / mixed)

#### Appearance

- Dark mode / light mode
- UI scale (compact / normal / large)

#### Support

- Help center
- Contact support
- Report a bug
- Terms of service
- Privacy policy

### Inventory

Users will be able to have an inventory. In this inventory they will be able to store different cosmetic components:

- Profile banners
- Avatars
- Emotes
- Scope designs

Free and premium users will have access to this functinality, and there will be a base options of items and an option to aquire new ones.



## Design and usage

### Authentication and plans

![Login Design](assets/Login.png)

Users may login inputting manually their mail and password, the recommended option is login with google. Footbar with disabled action buttons appears so the feel of the app stays the same.

![Signup Design](assets/Signup.png)

Users may signup with google, which is the recommended method due to it being very user friendly. Footbar with disabled action buttons appears so the feel of the app stays the same.

![Choose Plan](assets/Choose%20plan.png)

Upon creating an account users get a popup letting them choose a plan, free or premium. Details discussed above in the previous section in "Features and functionalities". A button is visible so users can click and view what the plan contains and what they are offered. By default is hidden to avoid clutter. *subject to change*.

### Home screen 

![Home (free)](assets/Home%20(Free).png)

The design of the home page for both free and premium users is very similar. At the top we have 2 buttons so they can either create or join a game. The footbar is enabled this time because the user has already logged in. 

The options you can access through the footbar are the following, listed as they appear from left to right:

- Settings
- Profile
- Matches
- Inventory
- Friends

Each of these buttons will redirect the user to the corresponding page.

![Home (premium)](assets/Home%20(Premium).png)

For the premium user, you can view the posts of other people. It will contain the avatar and username of the poster, in which you can click to view the details of the poster (in case its a public account). You can update, or downvote the post, share it on other platforms, send it to your facehunter friends and view the details of the game it was created taken on.

### Game creation screen

![Create game (Hunter)](assets/Create%20game%20(Hunter).png)

User is able to toggle between hunter and face mode, revealing the available gamemodes for each modality.

![Create game (Face)](assets/Create%20game%20(Face).png)

Upon selecting one mode, "Classic mode" for the face mode in this case, user can click the create button and invitations to all friends will be sent. 

![Join game](assets/Join%20game.png)

After a game is created, the creater (master) of the game gets redirected to the join screen, and the code for the game is already filled for him, so the other players can scan it. This way the joining process is fast, they all can provide the QR code to each other. 

In order for the game to start everyone will have to click the confirm button. Only when everyone has clicked "Click if ready" button, the game will start.

![In game](assets/Game%20(Classic).png)
![Post game](assets/Post-game.png)

These are basic mock designs for now. The design will change depending on the mode. 

## Modules (Technical)

FaceHunter can be divided in the following general modules.

- Authentication module: Self explanatory. Will work with Google OAuth to easily authenticate users and handle every request so we can separate features and actions free vs premium users have access to.
- Users module: Will handle every aspect of data related to users; including settings, profile options, inventory, friends list and blocked list.
- Posts module: This module will be in charge of the creation, deletion, modification and retrieval of posts.
- Messages module: This module will store and manage all messages sent between. It will handle the ingame notifications the user gets aswell.
- Games module: The games module has the mission to create games, handle player joins, tracking of the master of the game, game state ... It will be in close connection with the Face and Hunter modules in order to validate the shots.
- Face module: Module in charge of detecting faces, and matching faces to the different players in each game. Will be accessed via an API, as the code will live in a python server.
- Hunter module: Similar to the face module, it will handle heavy computer vision tasks, will be accessed via an API and live in a python server. Part of the hunter module will be native Kotlin code being executed in the devices in order to get the triangulation data.
- Report module: This module will handle bans, reports and any punishment related to violations of the terms of service.

Now we go deeper in detail for each module and how it functions.

## Future additions

- Login with Snapchat / Tiktok / Instagram. Login with Instagram would require us to dwelve and investigate the Meta ecosystem due to its closed nature. 
- Filters or scopes designs for premium and free users to enhance the taken photos.

## Notes

- Different color themes for hunter and face mode (two separate personalities)
- Game master can quick players