import { ShoppingListItem, ShoppingListResponse, Stock } from '../types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const defaultFetchOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const shoppingListApi = {
  // Get user's shopping list
  async getShoppingList(): Promise<ShoppingListItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/`, {
        method: 'GET',
        ...defaultFetchOptions,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch shopping list';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      throw error;
    }
  },

  // Add item to shopping list
  async addItemToShoppingList(
    stockId: number,
    quantity: number,
    stockItem: Stock
  ): Promise<ShoppingListItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/`, {
        method: 'POST',
        ...defaultFetchOptions,
        body: JSON.stringify({
          itemId: stockId,
          itemName: stockItem.itemName,
          quantity: quantity,
          unit: stockItem.unit,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add item to shopping list';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      throw error;
    }
  },

  // Update shopping list item quantity
  async updateShoppingListItem(
    id: number,
    quantity: number,
    stockItem: Stock
  ): Promise<ShoppingListItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/${id}`, {
        method: 'PUT',
        ...defaultFetchOptions,
        body: JSON.stringify({
          itemId: stockItem.id,
          itemName: stockItem.itemName,
          quantity: quantity,
          unit: stockItem.unit,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update shopping list item';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating shopping list item:', error);
      throw error;
    }
  },

  // Remove item from shopping list
  async removeShoppingListItem(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/${id}`, {
        method: 'DELETE',
        ...defaultFetchOptions,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove item from shopping list';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error removing shopping list item:', error);
      throw error;
    }
  },

  // Add shopping list item to stock (mark as bought and add to stock)
  async addShoppingListItemToStock(id: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shopping-list/${id}/add-to-stock`,
        {
          method: 'POST',
          ...defaultFetchOptions,
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to add shopping list item to stock';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding shopping list item to stock:', error);
      throw error;
    }
  },

  // Download shopping list as PDF
  async downloadShoppingListPDF(): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shopping-list/download/pdf`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to download shopping list PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading shopping list PDF:', error);
      throw error;
    }
  },

  // Get all stock items for selection
  async getAvailableStock(): Promise<Stock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stock`, {
        method: 'GET',
        ...defaultFetchOptions,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch stock items';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  },
};
