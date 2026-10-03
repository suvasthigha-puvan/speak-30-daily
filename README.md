# Speak 15 Daily

Build a modern, attractive responsive web app called Speak30. Here I have added only one day JSON as example. 

Purpose

Speak30 is a 30-day articulation and speaking practice app designed for a 30-minute daily practice routine.

The app should feel like a combination of a language-learning app + personal speaking coach + fitness tracker, not like a traditional English-learning website.

Main UI

Create these main sections:

Home / Today

Day X / 30

Current streak

Today's topic

Today's objective

30-minute estimated duration

Large Start Today's Practice button

Overall 30-day progress

Daily Practice
Show activities progressively:

Warm-up

Articulation exercise

Mini lesson

Vocabulary

Speaking challenge

AI conversation

Feedback

Retry

Include microphone recording UI, timer, play/re-record/submit controls and progress through the session.

Word Meaning
Any vocabulary word should be clickable.
Show:

simple meaning

pronunciation

example sentence

similar words

audio pronunciation if available

Save Word button

My Words
Display saved vocabulary and allow the user to practice them through speaking prompts.

Progress
Show:

30-day completion

streak

speaking time

clarity

pacing

vocabulary

filler-word usage

professional communication

weekly progress

Conversation
Provide an AI conversation interface where the user speaks and receives follow-up questions.

Design

Use a clean, modern, friendly and premium design.

Prioritize:

large typography

attractive cards

subtle animations

progress indicators

microphone-focused interaction

mobile and desktop responsiveness

minimal navigation

The main user flow should be:

Open app → Today's Practice → Speak → Feedback → Retry → Complete

Curriculum

Do not hard-code the lesson content into the UI.

The complete 30-day curriculum will be stored separately as a JSON file in GitHub.

The app should fetch/read the JSON and dynamically display:

day

week

topic

objectives

exercises

vocabulary

phrases

speaking prompts

conversation questions

feedback criteria

retry instructions

Design the data layer so I can later modify the JSON in GitHub and update the curriculum without modifying the UI code.

Start by building the UI, navigation, components, progress system and JSON data-loading structure. Use sample placeholder data until the real 30-day JSON is connected.

Then your GitHub structure can be very simple

I'd recommend:

speak30/
│
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── data/
│   └── curriculum.json
│
└── README.md

And later:

data/
└── curriculum.json

becomes your editable course content.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/95f6490b-dae0-40c1-90fd-95b2d1c971ad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
