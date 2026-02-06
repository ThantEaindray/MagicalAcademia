## 🧙‍♂️ Magical Academia – Backend Web Development (CA2)
---

## 📌 Project Overview
---
Magical Academia is a **Wellness Challenge Web Application** built using **Node.js, Express, and MySQL**.  
This project extends the backend developed in CA1 by integrating a frontend and adding authentication, validation, and gamification features.

Users can:
- Register and log in securely
- Complete wellness challenges to earn points
- Spend points on spells
- Join competitions
- View personal progress and user data

## Sections
---
1. Prerequisites and dependencies  
2. How to run  
3. Features  
4. API Documentation  

### 1 - Prerequisites and Dependencies
---
#### Prerequisites
---
Ensure the following prerequisites are installed:
- Node.js  
- npm (node package manager)  
- MySQL  

#### Dependencies
---
Before running tests, ensure the following dependencies are installed:
- dotenv (16.5.0 or higher)  
- express (5.1.0 or higher)  
- mysql2 (3.14.1 or higher)  

If you will be developing this project further, you will also need:
- nodemon (3.1.10 or higher)  

Create a `.env` file in your root directory:
```
DB_HOST=[host]

DB_USER=[username]

DB_PASSWORD=[password]

DB_DATABASE=[databasename]
```
These can be found inside your `mysql` workbench.

An example is shown here:

```
DB_HOST=localhost

DB_USER=root

DB_PASSWORD=password

DB_DATABASE=magic
```

### 2 - How to run
---
1. Install dependencies using a terminal prompt at the root directory: 

```
npm install
```

2. Initialise the database schema and tables:

```
npm run init_tables
```

 3. Start the server.

```
npm start
```
The application should now be running on `http://localhost:3000/` and testing can begin.

### 3 - Features
---

#### 1 User Management (Create / View / Update)
---
- Users can be created with a unique `username`.
- Duplicate usernames are blocked with **409 Conflict**.
- Users can be retrieved by list or by `user_id`.
- Updating a user supports changing `username` and `points`, with validation:
  - invalid `user_id` → **400 Bad Request**
  - non-numeric / negative `points` → **400 Bad Request**
  - username already used by another user → **409 Conflict**
  - user not found → **404 Not Found**

This keeps user data consistent and prevents invalid point values from being stored.

#### 2 Wellness Challenge Creation + Ownership-Controlled Updates
---
- Users can create wellness challenges by providing:
  - `user_id` (stored as `creator_id`)
  - `description`
  - `points`
- Each challenge may include a **points multiplier**, allowing certain challenges to reward bonus points.
- Challenge updates are **restricted to the creator**:
  - if `creator_id` ≠ `user_id` in request → **403 Forbidden**
  - missing fields → **400 Bad Request**
  - challenge not found → **404 Not Found**

This ensures only the owner of a challenge can modify its content.

#### 3 Completion Tracking + Automatic Points Reward
---
- When a user completes a challenge:
  - a completion record is inserted (stores optional `details`)
  - the user is rewarded with `points × multiplier`
- Users cannot repeatedly exploit challenge rewards due to backend validation.
- If the referenced `user_id` or `challenge_id` does not exist → **404 Not Found**

This reinforces gamification by rewarding meaningful progress.

#### 4 Safe Deletion (Removes Dependent Completion Records)
---
- Deleting a challenge will:
  1) delete all related completion records first  
  2) delete the challenge itself  
- If the challenge does not exist → **404 Not Found**
- If deleted successfully → **204 No Content**

This prevents orphan completion records and keeps the database clean.

#### 5 Gamification System (Magical Academia Theme)

These gamification mechanics are designed to encourage consistent engagement while preventing point exploitation through backend validation and ownership checks.

---

The system includes a full gamification layer:
- **Spells Shop** – users spend points to unlock magical spells
- **Inventory** – unlocked spells are permanently stored per user
- **Competitions** – users can join competitions to earn bonus points
- **Leaderboards** – rankings based on the number of challenge completed
- **Admin role** – admin users can seed and manage challenges

These features are implemented in a modular way and are ready for frontend integration in CA2.

### 4 - API Documentation
---
#### Authentication Routes

POST /register  

- Register a new user.
- Password is hashed using bcrypt.
```json
{
  "username": "ava",
  "email": "ava@example.com",
  "password": "password123"
}
```
POST /login

- Authenticate user and return a JWT token.
```json
{
  "username": "ava",
  "password": "password123"
}
```
GET /me

- Retrieve the currently logged-in user.
- Requires valid JWT token in Authorization header.

#### User Routes

GET /users  

- Retrieve all users.
- Admin only (JWT + role check required).

GET /users/:user_id  

- Retrieve a single user by ID.

POST /users

- Create a new user.
```json
{
  "username": "ava",
  "email": "ava@example.com",
  "password": "password123"
}
```
PUT /users/:user_id

- Update a user's details.
- Points are validated using middleware (must be non-negative).
```json
{
  "username": "ava_updated",
  "points": 120
}
```
#### Challenge Routes

GET /challenges

- Retrieve all challenges.

GET /challenges/:challenge_id

- Retrieves all completion attempts for a specific challenge.

POST /challenges

- Create a new challenge.
```json
{
  "user_id": 1,
  "description": "Sleep 7+ hours",
  "points": 50
}
```

POST /challenges/:challenge_id

- Create a completion record for a user attempting a challenge.
- Awards points to the user.
```json
{
  "user_id": 1,
  "details": "Felt more energised today."
}
```

PUT /challenges/:challenge_id

- Update a challenge (must be the creator).
```json
{
  "user_id": 1,
  "description": "Sleep 8+ hours",
  "points": 75
}
```

DELETE /challenges/:challenge_id

- Delete a challenge and its related completion records.
- Returns 204 No Content if deleted successfully.

#### Gamification Routes

GET /game/spells

- Retrieve all available spells in the shop.

GET /game/users/:user_id/spells

- Retrieve a user’s unlocked spell inventory.

GET /game/users/:user_id/completions

- Retrieve all challenges completed by a user.

GET /game/users/:user_id/competitions

- Retrieve all competitions joined by a user.

POST /game/users/:user_id/buy-spell

- Purchase a spell using points.
- Purchase a spell using points.
- Backend validates:
- Sufficient points
- Spell not already owned
```json
{
  "spell_id": 5
}
```

#### Competition Routes

GET /game/competitions

- Retrieve all competitions.

POST /game/competitions/:competition_id/join

- Join a competition and receive reward points.
- Backend prevents duplicate joins.
```json
{
  "user_id": 3
}
```

GET /game/competitions/:competition_id/leaderboard

- Retrieve leaderboard rankings for a competition.