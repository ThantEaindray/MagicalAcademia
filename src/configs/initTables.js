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
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  role VARCHAR(20) DEFAULT 'USER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WellnessChallenges (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

INSERT INTO Users (username, email, password_hash, points, role) VALUES
('admin', 'admin@magic.com', '$2b$10$yEaJx.68IZqIeuiu0wtBM.D2Xx4igP064WP4oWlIDqkSgIgOj3Fl2', 9999, 'ADMIN'),
('socuser321', 'socuser321@magic.com', '$2b$10$mU/n95K1yuDwjfDWm7NLkONHcmBUaqkOauW5ms/Z95mKAEpaOxOJ.', 60, 'USER'),
('wellnessKing', 'wellnessKing@magic.com', '$2b$10$gy9bFR6Wt/HtFxM1UZhgTuQc6NTTavoGBGeavcpc8w3lyjwOTIwqy', 120, 'USER'),
('avaMage', 'avaMage@magic.com', '$2b$10$lJpLdQMQ.9465HwSylEdjuut2r/SHilmlrtmZZu8UY0kC85/xwo4a', 200, 'USER'),
('gryffinRiser', 'gryffinRiser@magic.com', '$2b$10$gQlhBXbYBeCoH.g.t/U3LOnIjDIhrrW6221xpaNqqs34lggwZ93ae', 90, 'USER'),
('ravenPlanner', 'ravenPlanner@magic.com', '$2b$10$ijCj5wunuy4GE4zS1yGmkuJiZLVs1PS5qaMn6Awx220csg9G/MKNu', 150, 'USER'),
('slythGrind', 'slythGrind@magic.com', '$2b$10$GpypgzN8IMqqSlWItduV1eKqbgB7QZRkQCXC2tP5.BErWqW0Bmy7a', 80, 'USER');

INSERT INTO WellnessChallenges (creator_id, description, points, multiplier) VALUES
(1, 'Sleep like a prefect: 7+ hours of sleep', 10, 1.50),
(1, 'Take the stairs (no Floo Powder): choose stairs today', 20, 1.00),
(2, 'Digital detox: no phone for 1 hour', 10, 2.00),
(2, 'Touch grass: take a 15-minute walk outside', 10, 1.00),
(2, 'Talk IRL: have a real convo with a friend', 20, 1.00),
(3, 'Declutter desk: tidy your study space', 20, 1.50),
(3, 'Hydration check: drink 2 bottles of water', 10, 1.00),
(4, 'Stretch break: 10 minutes of stretching', 10, 1.00),
(5, 'Plan your day: write a short to-do list', 10, 1.00),
(6, 'Early start: begin your work before 10am', 20, 2.00);

INSERT INTO Courses (name, description, year_level) VALUES
('Charms', 'Learn everyday charms to build routines.', 1),
('Potions', 'Brew focus and energy through self-care routines.', 1),
('Defense Against the Dark Arts', 'Defend against distractions and procrastination.', 1),
('Transfiguration', 'Transform bad habits into productive ones.', 2),
('Care of Magical Creatures', 'Balance mental and physical wellness gently.', 2),
('Ancient Runes', 'Understand consistency and long-term patterns.', 2);

INSERT INTO Spells (name, effect, cost_points) VALUES
('Lumos', 'Creates light for late-night study sessions.', 0),
('Alohomora', 'Unlocks motivation to start tasks faster.', 10),
('Protego', 'Shields focus from distractions for a while.', 20),
('Expelliarmus', 'Disarms distractions like doom-scrolling.', 30),
('Expecto Patronum', 'Boosts morale during stressful weeks.', 40),
('Accio', 'Pulls your attention back to the task.', 25),
('Finite Incantatem', 'Ends bad habits temporarily.', 15),
('Reparo', 'Helps recover after a broken streak.', 35),
('Wingardium Leviosa', 'Lifts your mood and energy to keep going.', 20),
('Stupefy', 'Stuns distractions so you can finish work.', 30);

INSERT INTO Competitions (name, description, reward_points) VALUES
('House Cup', 'Earn points by completing challenges for your house.', 100),
('Triwizard Tournament', 'Hard mode competition for serious grinders.', 150),
('Dueling Club', 'Fastest completion wins points.', 120),
('O.W.L. Prep Week', 'Consistency week leading up to assessments.', 90),
('N.E.W.T. Mastery Challenge', 'Advanced challenge for disciplined students.', 130);

INSERT INTO CourseEnrollments (user_id, course_id, progress) VALUES
(1, 1, 20),
(1, 3, 35),
(1, 2, 10),
(2, 2, 55),
(2, 4, 15),
(3, 5, 30),
(3, 6, 25),
(4, 1, 40),
(4, 3, 60),
(5, 6, 45),
(5, 2, 30),
(6, 4, 20);

INSERT INTO UserCompletions (challenge_id, user_id, details) VALUES
(1, 1, 'Slept early and woke up on time.'),
(2, 1, 'Used stairs instead of lift.'),
(3, 2, 'Kept phone away during study.'),
(4, 3, 'Walked around campus for 15 mins.'),
(5, 2, 'Had a real convo with a friend.'),
(6, 3, 'Cleaned my desk before starting.'),
(7, 4, 'Finished 2 bottles of water.'),
(8, 5, 'Stretched after long sitting.'),
(9, 6, 'Planned a to-do list and followed it.'),
(10, 5, 'Started work early and stayed focused.');

INSERT INTO UserSpells (user_id, spell_id) VALUES
(1, 1),
(1, 3),
(1, 6),
(2, 2),
(2, 4),
(2, 7),
(3, 5),
(3, 8),
(4, 1),
(4, 10),
(5, 9),
(6, 3);

INSERT INTO UserCompetitionEntries (competition_id, user_id, score) VALUES
(1, 1, 60),
(1, 2, 45),
(1, 3, 75),
(2, 3, 90),
(2, 5, 80),
(3, 4, 50),
(3, 6, 55),
(4, 2, 70),
(4, 5, 65),
(5, 1, 85);
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error('Error creating tables:', error);
  } else {
    console.log('Tables created successfully');
  }
  process.exit();
});
