import { auth } from './auth';

const API_URL = 'https://functions.poehali.dev/170597f6-2ca7-4ea8-aa56-3bab0e5a86c1';
const DEALS_URL = 'https://functions.poehali.dev/049d4ca1-6d0b-4102-a156-fb6a03988a52';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  const user = auth.getUser();
  if (user) {
    headers['X-User-Id'] = user.id.toString();
  }
  
  return headers;
}

export const api = {
  async getGames() {
    const response = await fetch(`${API_URL}?action=games`);
    return response.json();
  },

  async getOffers(gameId?: number) {
    const url = gameId 
      ? `${API_URL}?action=offers&game_id=${gameId}`
      : `${API_URL}?action=offers`;
    const response = await fetch(url);
    return response.json();
  },

  async getMyOffers() {
    const response = await fetch(`${API_URL}?action=my-offers`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async createOffer(data: {
    game_id: number;
    category_id: number;
    title: string;
    description: string;
    price: number;
  }) {
    const response = await fetch(`${API_URL}?action=create-offer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка создания объявления');
    }
    return result;
  },

  async getMyDeals() {
    const response = await fetch(`${DEALS_URL}?action=my-deals`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async createDeal(offerId: number) {
    const response = await fetch(`${DEALS_URL}?action=create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ offer_id: offerId })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка создания сделки');
    }
    return result;
  },

  async payDeal(dealId: number) {
    const response = await fetch(`${DEALS_URL}?action=pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deal_id: dealId })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка оплаты');
    }
    return result;
  },

  async completeDeal(dealId: number) {
    const response = await fetch(`${DEALS_URL}?action=complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deal_id: dealId })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка завершения сделки');
    }
    return result;
  },

  async getMessages(dealId: number) {
    const response = await fetch(`${DEALS_URL}?action=messages&deal_id=${dealId}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async sendMessage(dealId: number, message: string) {
    const response = await fetch(`${DEALS_URL}?action=send-message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deal_id: dealId, message })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка отправки сообщения');
    }
    return result;
  }
};
