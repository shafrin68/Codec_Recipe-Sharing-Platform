import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://localhost:5000/api/recipes";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    category: "Breakfast"
  });

  async function loadRecipes() {
    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);

      const response = await fetch(`${API}?${params}`);

      if (!response.ok) throw new Error("Could not load recipes");

      setRecipes(await response.json());
      setMessage("");
    } catch {
      setMessage("Backend connect pannunga. MongoDB and server running-a irukkanum.");
    }
  }

  useEffect(() => {
    loadRecipes();
  }, [search, category]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function addRecipe(event) {
    event.preventDefault();

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setForm({
        title: "",
        ingredients: "",
        instructions: "",
        category: "Breakfast"
      });

      setMessage("Recipe added successfully!");
      loadRecipes();
    } catch (error) {
      setMessage(error.message || "Failed to add recipe");
    }
  }

  async function deleteRecipe(id) {
    if (!window.confirm("Delete this recipe?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Could not delete recipe");

      loadRecipes();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🍲 Recipe Sharing Platform</h1>
        <p>Discover, share and enjoy delicious recipes!</p>
      </header>

      <main>
        <section className="search-box">
          <h2>Find Recipes</h2>

          <input
            type="text"
            placeholder="Search recipe or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
            <option value="Other">Other</option>
          </select>
        </section>

        <section className="form-box">
          <h2>Share Your Recipe</h2>

          <form onSubmit={addRecipe}>
            <input
              name="title"
              placeholder="Recipe Name"
              value={form.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="ingredients"
              placeholder="Ingredients"
              value={form.ingredients}
              onChange={handleChange}
              required
            />

            <textarea
              name="instructions"
              placeholder="Cooking Instructions"
              value={form.instructions}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Dessert</option>
              <option>Other</option>
            </select>

            <button type="submit">Add Recipe</button>
          </form>
        </section>

        {message && <p className="message">{message}</p>}

        <section>
          <h2>Available Recipes</h2>

          <div className="recipe-list">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe._id}>
                <h3>{recipe.title}</h3>
                <span className="category">{recipe.category}</span>

                <h4>Ingredients</h4>
                <p>{recipe.ingredients}</p>

                <h4>Instructions</h4>
                <p>{recipe.instructions}</p>

                <button
                  className="delete"
                  onClick={() => deleteRecipe(recipe._id)}
                >
                  Delete
                </button>
              </article>
            ))}

            {recipes.length === 0 && (
              <p>No recipes found. Add your first recipe!</p>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>Recipe Sharing Platform © 2026</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
