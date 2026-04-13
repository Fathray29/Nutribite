import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, ChefHat, Heart, Clock, Sun, Moon } from 'lucide-react';
import { searchRecipes, Recipe } from './services/geminiService';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';

export default function App() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutribite_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nutribite_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // New State for Favorites and History
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('nutribite_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('nutribite_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nutribite_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('nutribite_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const toggleFavorite = (recipe: Recipe, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.some(r => r.id === recipe.id);
      if (isFav) return prev.filter(r => r.id !== recipe.id);
      return [...prev, recipe];
    });
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setActiveTab('search');
    executeSearch(historyQuery);
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    
    // Update history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5);
      return newHistory;
    });
    
    const filters = {
      diet: dietFilter !== 'Any' ? dietFilter : undefined,
      maxCaloriesPerServing: maxCalories !== 'Any' ? parseInt(maxCalories) : undefined
    };

    const results = await searchRecipes(searchQuery, filters);
    setRecipes(results);
    setIsLoading(false);
  };

  // Filters
  const [dietFilter, setDietFilter] = useState('Any');
  const [maxCalories, setMaxCalories] = useState('Any');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveTab('search');
    executeSearch(query);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f5f5f0] dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-300">
        {/* Header / Search Section */}
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-6 sm:py-8 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white transform -rotate-6">
                    <ChefHat size={24} />
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">NutriBite</h1>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="sm:hidden p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                <button 
                  onClick={() => setActiveTab('search')}
                  className={`text-sm font-medium px-4 py-2.5 sm:py-2 rounded-full transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${activeTab === 'search' ? 'bg-stone-900 dark:bg-orange-500 text-white' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                >
                  Search
                </button>
                <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`text-sm font-medium px-4 py-2.5 sm:py-2 rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-none ${activeTab === 'favorites' ? 'bg-stone-900 dark:bg-orange-500 text-white' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                >
                  <Heart size={16} className={activeTab === 'favorites' ? 'fill-current' : ''} />
                  Favorites ({favorites.length})
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hidden sm:flex p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors ml-2"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {activeTab === 'search' && (
              <>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-stone-400 dark:text-stone-500" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search recipes (e.g., 'healthy chicken')"
                      className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-stone-50 dark:bg-stone-800 border-transparent rounded-full text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:bg-white dark:focus:bg-stone-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 transition-all text-base sm:text-lg shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-stone-900 dark:bg-orange-500 text-white rounded-full font-medium hover:bg-stone-800 dark:hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 dark:focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg flex items-center justify-center min-h-[44px]"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Search'}
                  </button>
                </form>

                {searchHistory.length > 0 && (
                  <div className="mt-4 flex overflow-x-auto hide-scrollbar items-center gap-2 pb-2 sm:pb-0">
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider mr-1 flex items-center gap-1 whitespace-nowrap">
                      <Clock size={12} /> Recent:
                    </span>
                    {searchHistory.map((h, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleHistoryClick(h)}
                        className="text-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-3 py-1.5 sm:py-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors whitespace-nowrap"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}

                {/* Filters */}
                <div className="mt-4 sm:mt-6 flex overflow-x-auto hide-scrollbar items-center gap-3 sm:gap-4 pb-2 sm:pb-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    <Filter size={16} />
                    <span>Filters:</span>
                  </div>
                  
                  <select 
                    value={dietFilter}
                    onChange={(e) => setDietFilter(e.target.value)}
                    className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm rounded-full px-4 py-2 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-500 outline-none cursor-pointer min-h-[44px] sm:min-h-0"
                  >
                    <option value="Any">Any Diet</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Keto">Keto</option>
                    <option value="High Protein">High Protein</option>
                  </select>

                  <select 
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value)}
                    className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm rounded-full px-4 py-2 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-500 outline-none cursor-pointer min-h-[44px] sm:min-h-0"
                  >
                    <option value="Any">Any Calories</option>
                    <option value="300">Under 300 kcal</option>
                    <option value="500">Under 500 kcal</option>
                    <option value="800">Under 800 kcal</option>
                  </select>
                </div>
              </>
            )}
            
            {activeTab === 'favorites' && (
              <div className="py-2 sm:py-4">
                <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">Your Favorite Recipes</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Saved recipes for quick access.</p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          {activeTab === 'search' ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-500 dark:text-stone-400">
                <Loader2 className="animate-spin h-10 w-10 mb-4 text-orange-500" />
                <p className="text-lg font-medium text-center">Searching the web for the perfect recipes...</p>
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onClick={setSelectedRecipe} 
                    isFavorite={favorites.some(r => r.id === recipe.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100 mb-2">No recipes found</h3>
                <p className="text-stone-500 dark:text-stone-400">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-stone-800 dark:text-stone-200 mb-4">What are you craving?</h2>
                <p className="text-stone-500 dark:text-stone-400 text-base sm:text-lg max-w-lg mx-auto">
                  Search for any dish, ingredient, or cuisine. We'll find real recipes from the web and calculate all the nutritional details for you.
                </p>
              </div>
            )
          ) : (
            /* Favorites Tab */
            favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {favorites.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onClick={setSelectedRecipe} 
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 mb-4">
                  <Heart size={32} />
                </div>
                <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100 mb-2">No favorites yet</h3>
                <p className="text-stone-500 dark:text-stone-400">Save recipes you love by clicking the heart icon.</p>
              </div>
            )
          )}
        </main>

        {/* Modal */}
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          isFavorite={selectedRecipe ? favorites.some(r => r.id === selectedRecipe.id) : false}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
}
