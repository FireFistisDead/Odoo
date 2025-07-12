# 🚀 Skill Swap Platform — Grow Together 🤝💡
A Skill Swap Web Application built to help individuals offer, request, and exchange skills, enhanced by an AI-powered chatbot (GrowBot) that gives intelligent suggestions using Gemini Pro API.

<!-- Replace with your actual banner link -->

## 🧠 What is Skill Swap?
🌐 A platform where users can:

List the skills they offer

Request the skills they want to learn

Browse and connect with others in a community-driven ecosystem

Let AI suggest which skills to learn next and whom to learn them from!

# ✨ Features
## 👤 User Side:
Create a public/private profile with photo, name, and skills

Add skills you offer and want

Mark your availability (weekends, evenings, etc.)

Send, accept, or reject swap requests

Delete pending swap requests

Rate others after swaps ✅

## 🔍 Skill Matching & Suggestions
Match percentage is calculated based on overlapping skills.

Shows recommended users with skills and match scores.

Users can send friend requests and build a network.
![WhatsApp Image 2025-07-12 at 16 57 20_284a0c13](https://github.com/user-attachments/assets/7d838263-fffa-40fc-af5b-ccad38cfcb54)

## 🧾 User Profile Management
Users can input name, location (optional), and a short bio.

Add skills you offer and want to learn using interactive tags.

Choose availability from options like weekends, evenings, etc.

Toggle to make profile public or private.

Clean, user-friendly form to manage everything in one place.
![WhatsApp Image 2025-07-12 at 16 57 21_b14e63b2](https://github.com/user-attachments/assets/4589c7cd-c5fd-44f6-b307-bbc62a470370)




## 🧑‍🤝‍🧑 User-to-User Swap Interface
Detailed modals show:

Name, location, availability

Skills offered and wanted

Ratings and number of successful swaps

One-click Request or Offer functionality.
![WhatsApp Image 2025-07-12 at 16 57 21_23996f00](https://github.com/user-attachments/assets/1c09d7ce-7a2a-4e69-9132-ce1c1577249a)



## 🔁 Swap Flow
Initiate Swap: Users send skill swap requests to others.

Respond: The receiver can accept or reject requests.

Cancel: Users can delete a request if it remains pending too long.

After Swap: Rate and review your experience.
![WhatsApp Image 2025-07-12 at 16 55 40_ea7263fb](https://github.com/user-attachments/assets/79eff05c-b405-4327-9b15-4833bf951906)



## 🤖 GrowBot (AI Chat Assistant):
Built with Gemini Pro API

Chat with GrowBot for:

Skill suggestions (e.g., “I know Excel” → Suggests Power BI)

How-to advice on skill swaps

Fun facts, jokes, or general help
![WhatsApp Image 2025-07-12 at 17 23 09_70d0e1f7](https://github.com/user-attachments/assets/65dcfb4f-aab7-4f86-b555-f9579bea67e3)


## 🧑‍💻 Admin Panel:
Review and reject spammy skills

Ban users violating policies

Monitor swap activity logs

Send platform-wide messages

Export reports and statistics




## 🔥 Bonus Features
Top Skill Trends: See what skills are most in-demand on the platform

Auto-Suggest Swaps: Intelligent pairing of users based on mutual skill interests

Skill Path Builder: Recommend a learning path based on user’s current skills

# WireFrame
![WhatsApp Image 2025-07-12 at 17 10 52_2310c8b2](https://github.com/user-attachments/assets/3e45843f-4a11-4368-9d3e-257340945cd6)


## 🛠 Tech Stack
Frontend	Backend (Optional)	Database	AI Integration
React (Node.js)	Express (optional)	Firebase Firestore	Gemini Pro (Google Generative AI)

## 💬 How to Use GrowBot (Chatbot)
js
Copy
Edit
// From frontend, trigger:
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY

// Example prompt:
{
  contents: [{ parts: [{ text: "I know Photoshop, what should I learn next?" }] }]
}
🔧 Key Features
1. 📝 User Profile Management
Basic Info: Users can input their name, location (optional), and a short bio.

Skills I Offer / Skills I Want to Learn: Add and manage skills as tags.

Availability: Dropdown menu to set availability (e.g., weekends, evenings).

Privacy Settings: Choose to make the profile public or private.

Screenshot:
![Edit Profile](attachment:/mnt/data/Screenshot 2025-07-12 163739.png)

2. 🤝 Skill Matching & Suggestions
The system calculates a match percentage based on shared skills.

View recommended friends with skills and mutual interest scores.

Send Friend Requests to connect and collaborate.

Screenshot:
![Dashboard](attachment:/mnt/data/Screenshot 2025-07-12 164726.png)

3. 🔄 User-to-User Swap Interface
View complete profile modal of users.

Check skills offered and wanted, along with location & availability.

Request/Offer swaps with one click.

View user rating and completed swaps.

Screenshots:
![Mike Chen Profile](attachment:/mnt/data/Screenshot 2025-07-12 164749.png)
![Mike Chen Modal](attachment:/mnt/data/Screenshot 2025-07-12 164813.png)

4. 🔁 Swap Flow
Swap Actions:

Request a skill from another user

Accept or reject incoming swap requests

Cancel/delete pending requests if no response

Post-Swap:

Users give feedback and ratings after completing a skill exchange
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
