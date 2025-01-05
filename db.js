// db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'recipes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not open database', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create the 'recipes' table if it doesn't exist
const createRecipesTableQuery = `
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL
    );
`;

db.run(createRecipesTableQuery, (err) => {
    if (err) {
        console.error('Error creating recipes table:', err.message);
    }
});

// Create the 'collections' table if it doesn't exist
const createCollectionsTableQuery = `
    CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
`;

db.run(createCollectionsTableQuery, (err) => {
    if (err) {
        console.error('Error creating collections table:', err.message);
    }
});

// Create the 'recipe_collection' table if it doesn't exist
const createRecipeCollectionTableQuery = `
    CREATE TABLE IF NOT EXISTS recipe_collection (
        recipe_id INTEGER NOT NULL,
        collection_id INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (collection_id) REFERENCES collections(id),
        PRIMARY KEY (recipe_id, collection_id)
    );
`;

db.run(createRecipeCollectionTableQuery, (err) => {
    if (err) {
        console.error('Error creating recipe_collection table:', err.message);
    }
});

module.exports = db;