const pool = require('../services/db');

// Initialise tables and add test data

const SQLSTATEMENT = `
DROP TABLE IF EXISTS UserCompetitionEntries;
DROP TABLE IF EXISTS Competitions;
DROP TABLE IF EXISTS UserSpells;
DROP TABLE IF EXISTS Spells;
DROP TABLE IF EXISTS CourseEnrollments;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS UserCompletions;
DROP TABLE IF EXISTS WellnessChallenges;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  points INT DEFAULT 0
);

CREATE TABLE WellnessChallenges (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

CREATE TABLE UserCompletions (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year_level INT DEFAULT 1
);

CREATE TABLE CourseEnrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, course_id)
);

CREATE TABLE Spells (
  spell_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  effect TEXT NOT NULL,
  cost_points INT DEFAULT 0
);

CREATE TABLE UserSpells (
  user_spell_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  spell_id INT NOT NULL,
  unlocked_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, spell_id)
);

CREATE TABLE Competitions (
  competition_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reward_points INT DEFAULT 50,
  starts_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserCompetitionEntries (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  competition_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT DEFAULT 0,
  joined_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (competition_id, user_id)
);

INSERT INTO Users (username, points) VALUES
('socuser321', 0),
('wellnessKing', 0),
('avaMage', 0);

INSERT INTO WellnessChallenges (creator_id, description, points) VALUES
(1, 'Sleep like a boss – Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. – Take the stairs today', 20),
(2, 'Digital detox (mini edition) – No phone for 1 hour', 10),
(2, 'Touch grass IRL – Take a 15-minute walk outside', 10),
(2, 'IRL > DMs – Talk to a friend face-to-face', 20),
(3, 'Declutter your chaos – Clean your desk or room', 20),
(3, 'Help a homie – Assist someone without being asked', 20);

INSERT INTO Courses (name, description, year_level) VALUES
('Charms of Consistency', 'Build good habits using small daily actions.', 1),
('Potions for Focus', 'Improve focus and concentration routines.', 1),
('Defense Against Distraction', 'Learn to block procrastination.', 1);

INSERT INTO Spells (name, effect, cost_points) VALUES
('Inkglow Notes', 'Reveal a short study tip after completing a challenge.', 0),
('Mindsharpen', 'Gain +5 bonus points on your next completion.', 20),
('TimeStitch', 'One-time streak save token.', 50),
('Ward of Study', 'Small point bonus for the next 24 hours.', 30);

INSERT INTO Competitions (name, description, reward_points) VALUES
('House Cup: Week 1', 'Complete any 3 challenges this week.', 80),
('Duel of Discipline', 'Highest challenge score wins.', 100);
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error('Error creating tables:', error);
  } else {
    console.log('Tables created successfully');
  }
  process.exit();
});
