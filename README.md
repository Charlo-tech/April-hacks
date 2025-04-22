# GeoFunFacts

This is a locations app that uses countries APIs to give info about a country. Good for when you visit a new country and need to learn a quick thing or two about it. It also makes use of Gemini API to give fun facts about that particular country. It also has a flights feature using aviationstack APIs to show flights in and out of that particular country. The app has memory capacity to show where you've been or searched, something I call the digital passport.

## Installation

The initialisation process is simple.

```bash
Git clone https://github.com/Charlo-tech/April-hacks
cd April-hacks
npm install
npm start
```
This will clone the project into your local machine, install dependencies and run it in localhost for testing.

## APIs
The countries API does not require a key to use and it is already intergrated in the files. The Gemini API key can be gotten from the developer dashboard of Google and Aviationstacks API can be gotten from aviationstacks.com. All these are put in the .env file for smooth running.
```bash
.env
GEMINI_API_KEY=''
AVIATION_STACKS_API=''
```

## Images
The following are sample images of the tool in action.

## License

[MIT](https://choosealicense.com/licenses/mit/)
