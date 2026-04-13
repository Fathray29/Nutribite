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
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-stone-100 flex flex-col h-full"
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
            <span key={idx} className="bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              {label}
            </span>
          ))}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Contains: {recipe.allergens.slice(0, 1).join(', ')}
            </span>
          )}
        </div>
        <button 
          onClick={(e) => onToggleFavorite(recipe, e)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-stone-400"} />
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif text-xl font-medium text-stone-900 mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-stone-500 text-sm pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-stone-400" />
            <span>{recipe.prepTime + recipe.cookTime}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-stone-400" />
            <span>{recipe.baseServings}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 font-medium">
            <Flame size={16} />
            <span>{Math.round(totalCalories)} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
