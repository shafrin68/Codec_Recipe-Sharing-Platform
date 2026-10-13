const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/recipeDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: "Other"
  }
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Get recipes and search/filter
app.get("/api/recipes", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { ingredients: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const recipes = await Recipe.find(filter).sort({ _id: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// Add a recipe
app.post("/api/recipes", async (req, res) => {
  try {
    const { title, ingredients, instructions, category } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof ingredients !== "string" || !ingredients.trim() ||
      typeof instructions !== "string" || !instructions.trim()
    ) {
      return res.status(400).json({
        message: "Title, ingredients and instructions are required"
      });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      category: typeof category === "string" && category.trim()
        ? category.trim()
        : "Other"
    });

    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Failed to add recipe" });
  }
});

// Delete a recipe
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
