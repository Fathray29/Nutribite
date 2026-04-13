import React from 'react';
import { Clock, Users, Flame, Heart } from 'lucide-react';
import { Recipe } from '../services/geminiService';

interface RecipeCardProps {
  key?: string;
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe, e: React.MouseEvent) => void;
}

export function RecipeCard({ recipe, onClick, isFavorite, onToggleFavorite }: RecipeCardProps) {
  const totalCalories = recipe.ingredients.reduce((sum, ing) => sum + ing.calories, 0);

  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-stone-100 dark:border-stone-800 flex flex-col h-full"
    >
      <div className="relative h-48 w-full">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[80%]">
          {recipe.dietaryLabels.slice(0, 2).map((label, idx) => (
            <span key={idx} className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm text-stone-800 dark:text-stone-200 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              {label}
            </span>
          ))}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <span className="bg-red-500/90 dark:bg-red-600/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Contains: {recipe.allergens.slice(0, 1).join(', ')}
            </span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe, e);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-stone-700 transition-colors"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-stone-400 dark:text-stone-500"} />
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 line-clamp-2 flex-grow">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-sm pt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-stone-400 dark:text-stone-500" />
            <span>{recipe.prepTime + recipe.cookTime}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-stone-400 dark:text-stone-500" />
            <span>{recipe.baseServings}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
            <Flame size={16} />
            <span>{Math.round(totalCalories)} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
