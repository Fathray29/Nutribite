import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Clock, Users, Flame, Droplet, Beef, Heart, AlertTriangle } from 'lucide-react';
import { Recipe } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe, e?: React.MouseEvent) => void;
}

export function RecipeModal({ recipe, onClose, isFavorite, onToggleFavorite }: RecipeModalProps) {
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.baseServings);
    }
  }, [recipe]);

  if (!recipe) return null;

  const scale = servings / recipe.baseServings;

  const totalNutrition = recipe.ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories * scale,
      protein: acc.protein + ing.protein * scale,
      fat: acc.fat + ing.fat * scale,
      carbs: acc.carbs + ing.carbs * scale,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
              onClick={(e) => onToggleFavorite(recipe, e)}
              className="bg-white/80 backdrop-blur-md text-stone-800 p-2 rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-stone-800"} />
            </button>
            <button 
              onClick={onClose}
              className="bg-white/80 backdrop-blur-md text-stone-800 p-2 rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow">
            <div className="relative h-64 sm:h-80 w-full">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white">
                <div className="flex gap-2 flex-wrap mb-3">
                  {recipe.dietaryLabels.map((label, idx) => (
                    <span key={idx} className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-medium px-3 py-1 rounded-full">
                      {label}
                    </span>
                  ))}
                  {recipe.allergens && recipe.allergens.length > 0 && (
                    <span className="bg-red-500/80 backdrop-blur-md text-white border border-red-400/50 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Allergens: {recipe.allergens.join(', ')}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium mb-2">{recipe.title}</h2>
                <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={18} />
                    <span>{recipe.prepTime + recipe.cookTime} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame size={18} className="text-orange-400" />
                    <span>{Math.round(totalNutrition.calories)} kcal total</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                {recipe.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column: Ingredients & Servings */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-2xl font-medium text-stone-900">Ingredients</h3>
                    
                    <div className="flex items-center bg-stone-100 rounded-full p-1">
                      <button 
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-stone-600 shadow-sm hover:text-stone-900 disabled:opacity-50"
                        disabled={servings <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium text-stone-900">
                        {servings}
                      </span>
                      <button 
                        onClick={() => setServings(servings + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-stone-600 shadow-sm hover:text-stone-900"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start justify-between p-3 rounded-2xl hover:bg-stone-50 transition-colors">
                        <div>
                          <span className="font-medium text-stone-900 block">{ing.name}</span>
                          <span className="text-sm text-stone-500">
                            {+(ing.amount * scale).toFixed(1)} {ing.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-orange-600 block">
                            {Math.round(ing.calories * scale)} kcal
                          </span>
                          <span className="text-xs text-stone-400">
                            P: {+(ing.protein * scale).toFixed(1)}g · F: {+(ing.fat * scale).toFixed(1)}g
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Column: Nutrition & Instructions */}
                <div>
                  <div className="bg-stone-50 rounded-3xl p-6 mb-8">
                    <h3 className="font-serif text-xl font-medium text-stone-900 mb-4">Nutrition per serving</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 text-orange-500 mb-1">
                          <Flame size={18} />
                          <span className="text-sm font-medium">Calories</span>
                        </div>
                        <span className="text-2xl font-medium text-stone-900">
                          {Math.round(totalNutrition.calories / servings)}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                          <Beef size={18} />
                          <span className="text-sm font-medium">Protein</span>
                        </div>
                        <span className="text-2xl font-medium text-stone-900">
                          {Math.round(totalNutrition.protein / servings)}g
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                          <Droplet size={18} />
                          <span className="text-sm font-medium">Fat</span>
                        </div>
                        <span className="text-2xl font-medium text-stone-900">
                          {Math.round(totalNutrition.fat / servings)}g
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 text-green-500 mb-1">
                          <div className="w-4 h-4 rounded-full border-2 border-current" />
                          <span className="text-sm font-medium">Carbs</span>
                        </div>
                        <span className="text-2xl font-medium text-stone-900">
                          {Math.round(totalNutrition.carbs / servings)}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-medium text-stone-900 mb-6">Instructions</h3>
                    <ol className="space-y-6">
                      {recipe.instructions.map((step, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium text-sm">
                            {idx + 1}
                          </span>
                          <p className="text-stone-700 leading-relaxed pt-1">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
