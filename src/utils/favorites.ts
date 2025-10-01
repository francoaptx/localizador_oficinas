import { Office } from '@/data/offices';

const FAVORITES_KEY = 'office_favorites';

export const getFavorites = (): string[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return [];
  }
};

export const addToFavorites = (officeId: string): void => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(officeId)) {
      favorites.push(officeId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
  }
};

export const removeFromFavorites = (officeId: string): void => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(id => id !== officeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error al remover de favoritos:', error);
  }
};

export const isFavorite = (officeId: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(officeId);
};

export const getFavoriteOffices = (allOffices: Office[]): Office[] => {
  const favoriteIds = getFavorites();
  return allOffices.filter(office => favoriteIds.includes(office.id));
};