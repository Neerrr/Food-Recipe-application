const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database connection

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'web' directory with correct MIME type for JavaScript files
app.use(express.static(path.join(__dirname, '../web'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    res.setHeader('Cache-Control', 'no-store'); // Disable caching
  }
}));

// Route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web', 'index.html'));
});

// POST route to save a recipe in the database
app.post('/api/recipes', (req, res) => {
  const { name, ingredients, instructions } = req.body;

  if (!name || !ingredients || !instructions) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)';
  db.run(query, [name, ingredients, instructions], function (err) {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).send({ message: 'Error adding recipe to the database' });
    }
    res.status(201).json({ message: 'Recipe added successfully!', id: this.lastID });
  });
});

// GET route to fetch recipes from the database
app.get('/api/recipes', (req, res) => {
  db.all('SELECT * FROM recipes', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      recipes: rows
    });
  });
});

// PUT route to update a recipe in the database
app.put('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const { name, ingredients, instructions } = req.body;

  if (!name || !ingredients || !instructions) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'UPDATE recipes SET name = ?, ingredients = ?, instructions = ? WHERE id = ?';
  db.run(query, [name, ingredients, instructions, id], function (err) {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).send({ message: 'Error updating recipe in the database' });
    }
    res.status(200).json({ message: 'Recipe updated successfully!' });
  });
});

// DELETE route to delete a recipe from the database
app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM recipes WHERE id = ?';
  db.run(query, id, function (err) {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).send({ message: 'Error deleting recipe from the database' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully!' });
  });
});

// POST route to create a collection
app.post('/api/collections', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({ message: 'Name is required.' });
  }

  const query = 'INSERT INTO collections (name) VALUES (?)';
  db.run(query, [name], function (err) {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).send({ message: 'Error creating collection in the database' });
    }
    res.status(201).json({ message: 'Collection created successfully!', id: this.lastID });
  });
});

// POST route to add a recipe to a collection by names
app.post('/api/collections/add-recipe', (req, res) => {
  const { collectionName, recipeName } = req.body;

  if (!collectionName || !recipeName) {
    return res.status(400).send({ message: 'Collection name and recipe name are required.' });
  }

  const getCollectionIdQuery = 'SELECT id FROM collections WHERE name = ?';
  const getRecipeIdQuery = 'SELECT id FROM recipes WHERE name = ?';

  db.get(getCollectionIdQuery, [collectionName], (err, collection) => {
    if (err || !collection) {
      return res.status(500).send({ message: 'Error finding collection.' });
    }

    db.get(getRecipeIdQuery, [recipeName], (err, recipe) => {
      if (err || !recipe) {
        return res.status(500).send({ message: 'Error finding recipe.' });
      }

      const query = 'INSERT INTO recipe_collection (recipe_id, collection_id) VALUES (?, ?)';
      db.run(query, [recipe.id, collection.id], function (err) {
        if (err) {
          console.error('DB error:', err.message);
          return res.status(500).send({ message: 'Error adding recipe to collection in the database' });
        }
        res.status(201).json({ message: 'Recipe added to collection successfully!' });
      });
    });
  });
});

// DELETE route to delete a collection from the database
app.delete('/api/collections/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM collections WHERE id = ?';
  db.run(query, id, function (err) {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).send({ message: 'Error deleting collection from the database' });
    }
    res.status(200).json({ message: 'Collection deleted successfully!' });
  });
});

// GET route to fetch collections with their recipes
app.get('/api/collections', (req, res) => {
  const query = `
    SELECT collections.id as collection_id, collections.name as collection_name, recipes.id as recipe_id, recipes.name as recipe_name, recipes.ingredients, recipes.instructions
    FROM collections
    LEFT JOIN recipe_collection ON collections.id = recipe_collection.collection_id
    LEFT JOIN recipes ON recipe_collection.recipe_id = recipes.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const collections = {};
    rows.forEach(row => {
      if (!collections[row.collection_id]) {
        collections[row.collection_id] = {
          id: row.collection_id,
          name: row.collection_name,
          recipes: []
        };
      }
      if (row.recipe_id) {
        collections[row.collection_id].recipes.push({
          id: row.recipe_id,
          name: row.recipe_name,
          ingredients: row.ingredients,
          instructions: row.instructions
        });
      }
    });

    res.json({
      collections: Object.values(collections)
    });
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});