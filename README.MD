# Online Interactive Jeopardy Game
This game has been built on NodeJS using socket.io to form a communication between players. MongoDB is used for Database and bcrypt is used for password hashing.
live: http://jeopardyonline.herokuapp.com/

## CREATING A NEW QUIZ
Upon logging in, users can create their own quizzes. /quiz will provide a section to create a new quiz, and the user will be directed to the quiz page. The user will be able to add, update or delete the quiz as long as they are logged in. Each Update or deletion will also update or delete the query in the database to sync the front-end with back-end.

## Game Logic

### Players
Players can connect on /game/connect page providing, first, the pin, and then a username for their game. The creator of the game will be the admin of the game, and will lead through the game.

Each player will wait for their turn to choose a value in the quiz talbe for the question and answer the question. If the answer is false, the other players will be given a chance to buy the question for its half value. If they do not have enough points to buy the question, they will not be provided with the chance.

### Scores
The players receive the value of the question upon answering correctly. If the question is bought for a half value, their scores will decrease accordingly, but if the correct answer is found, they will receive the full score.

### Timing
Each session will be 30 seconds long. When the time is over, the players lose their chance to answer the question.

## FINAL NOTE
The code currenlty lacks full functionality of a website/app. In the future implementations, some features will be added or modified.

Possible future improvements for the app:
- Modify the style of the website for a better user experience
- Improve/fix mobile look
- Add a navigation bar
- Improve log in/register routes.
- Warn the players when they want to refresh the page.
- Keep the data of the players (usernames & scores) for a more gamified app
- Redirect users to another page when the admin loses connection or quits the game
- Use React or Vue to wrap the components instead of using pure JS
