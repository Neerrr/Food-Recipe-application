// Add a new recipe
function addRecipe(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const ingredients = document.getElementById('ingredients').value;
    const instructions = document.getElementById('instructions').value;

    fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ingredients, instructions }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Recipe added!');
        fetchRecipes(); // Refresh the list of recipes
        fetchCollections(); // Refresh the list of collections
        document.getElementById('recipe-form').reset(); // Clear the form
    })
    .catch(error => console.error('Error:', error));
}

// Fetch and display recipes
function fetchRecipes() {
    fetch('/api/recipes')
    .then(response => response.json())
    .then(data => {
        const recipeList = document.getElementById('recipe-list');
        recipeList.innerHTML = ''; // Clear the list
        data.recipes.forEach(recipe => {
            const li = document.createElement('li');
            li.textContent = `${recipe.name}: ${recipe.ingredients} - ${recipe.instructions}`;
            const editButton = createButton('Edit', 'green', () => editRecipe(recipe));
            const deleteButton = createButton('Delete', 'red', () => deleteRecipe(recipe.id));
            const addToCollectionButton = createButton('Add to Collection', 'blue', () => addToCollection(recipe.name));
            li.append(editButton, deleteButton, addToCollectionButton);
            recipeList.appendChild(li);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Edit a recipe
function editRecipe(recipe) {
    document.getElementById('name').value = recipe.name;
    document.getElementById('ingredients').value = recipe.ingredients;
    document.getElementById('instructions').value = recipe.instructions;

    const form = document.getElementById('recipe-form');
    form.removeEventListener('submit', addRecipe); // Remove the addRecipe event listener
    form.addEventListener('submit', function updateRecipe(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const ingredients = document.getElementById('ingredients').value;
        const instructions = document.getElementById('instructions').value;

        fetch(`/api/recipes/${recipe.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ingredients, instructions }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Recipe updated!');
            fetchRecipes(); // Refresh the list of recipes
            fetchCollections(); // Refresh the list of collections
            document.getElementById('recipe-form').reset(); // Clear the form
            form.removeEventListener('submit', updateRecipe); // Remove the updateRecipe event listener
            form.addEventListener('submit', addRecipe); // Re-add the addRecipe event listener
        })
        .catch(error => console.error('Error:', error));
    }, { once: true }); // Ensure the event listener is added only once
}

// Delete a recipe
function deleteRecipe(id) {
    fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Recipe deleted!');
        fetchRecipes(); // Refresh the list of recipes
        fetchCollections(); // Refresh the list of collections
    })
    .catch(error => console.error('Error:', error));
}

// Add a recipe to a collection
function addToCollection(recipeName) {
    const collectionName = prompt('Enter collection name:');
    if (!collectionName) return;

    fetch('/api/collections/add-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName, recipeName }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Recipe added to collection!');
        fetchCollections(); // Refresh the list of collections
    })
    .catch(error => console.error('Error:', error));
}

// Fetch and display collections
function fetchCollections() {
    fetch('/api/collections')
    .then(response => response.json())
    .then(data => {
        const collectionList = document.getElementById('collection-list');
        collectionList.innerHTML = ''; // Clear the list
        data.collections.forEach(collection => {
            const li = document.createElement('li');
            li.textContent = collection.name;
            const deleteButton = createButton('Delete', 'red', () => deleteCollection(collection.id));
            const addRecipeButton = createButton('Add Recipe', 'orange', () => addRecipeToCollection(collection.name));
            const ul = document.createElement('ul');
            collection.recipes.forEach(recipe => {
                const recipeLi = document.createElement('li');
                recipeLi.textContent = `${recipe.name}: ${recipe.ingredients} - ${recipe.instructions}`;
                ul.appendChild(recipeLi);
            });
            li.append(deleteButton, addRecipeButton, ul);
            collectionList.appendChild(li);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Delete a collection
function deleteCollection(id) {
    fetch(`/api/collections/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Collection deleted!');
        fetchCollections(); // Refresh the list of collections
    })
    .catch(error => console.error('Error:', error));
}

// Add a recipe to a collection
function addRecipeToCollection(collectionName) {
    const recipeName = prompt('Enter recipe name:');
    if (!recipeName) return;

    fetch('/api/collections/add-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName, recipeName }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Recipe added to collection!');
        fetchCollections(); // Refresh the list of collections
    })
    .catch(error => console.error('Error:', error));
}

// Create a button with specified text, color, and click handler
function createButton(text, color, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.backgroundColor = color;
    button.style.color = 'white';
    button.onclick = onClick;
    return button;
}

// Initialize the page by fetching recipes and collections
document.getElementById('recipe-form').addEventListener('submit', addRecipe);
fetchRecipes();
fetchCollections();