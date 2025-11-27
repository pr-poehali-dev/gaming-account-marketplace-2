import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import AuthDialog from '@/components/AuthDialog';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Game {
  id: number;
  name: string;
  image: string;
  regions?: string[];
  categories: { id: number; name: string; }[];
}

interface Offer {
  id: number;
  game: string;
  category: string;
  seller: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  online: boolean;
}

interface Deal {
  id: number;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  buyer: string;
  seller: string;
  is_buyer: boolean;
}

interface Message {
  id: number;
  message: string;
  created_at: string;
  username: string;
  is_own: boolean;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAddOfferDialog, setShowAddOfferDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const [games, setGames] = useState<Game[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [myDeals, setMyDeals] = useState<Deal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.getUser());

  const [newOffer, setNewOffer] = useState({
    game_id: 0,
    category_id: 0,
    title: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    loadGames();
    loadOffers();
    if (user) {
      loadMyOffers();
      loadMyDeals();
    }
  }, [user]);

  const loadGames = async () => {
    try {
      const data = await api.getGames();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      const data = await api.getOffers();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const loadMyOffers = async () => {
    try {
      const data = await api.getMyOffers();
      setMyOffers(data.offers || []);
    } catch (error) {
      console.error('Error loading my offers:', error);
    }
  };

  const loadMyDeals = async () => {
    try {
      const data = await api.getMyDeals();
      setMyDeals(data.deals || []);
    } catch (error) {
      console.error('Error loading my deals:', error);
    }
  };

  const loadMessages = async (dealId: number) => {
    try {
      const data = await api.getMessages(dealId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleAuthSuccess = () => {
    setUser(auth.getUser());
    loadMyOffers();
    loadMyDeals();
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setActiveTab('home');
  };

  const handleBuyClick = async (offer: Offer) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedOffer(offer);
    setShowOfferDialog(true);
  };

  const handleCreateDeal = async () => {
    if (!selectedOffer) return;
    
    try {
      const result = await api.createDeal(selectedOffer.id);
      alert(`Сделка создана! ID: ${result.deal_id}`);
      setShowOfferDialog(false);
      loadMyDeals();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePayDeal = async (dealId: number) => {
    try {
      await api.payDeal(dealId);
      alert('Оплата прошла успешно!');
      loadMyDeals();
      setUser(auth.getUser());
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCompleteDeal = async (dealId: number) => {
    try {
      await api.completeDeal(dealId);
      alert('Сделка завершена!');
      loadMyDeals();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOffer(newOffer);
      alert('Объявление создано!');
      setShowAddOfferDialog(false);
      loadMyOffers();
      loadOffers();
      setNewOffer({ game_id: 0, category_id: 0, title: '', description: '', price: 0 });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleOpenDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDialog(true);
    loadMessages(deal.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDeal) return;
    
    try {
      await api.sendMessage(selectedDeal.id, newMessage);
      setNewMessage('');
      loadMessages(selectedDeal.id);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = ['0', '2', '7', '8'];

  const filteredGames = selectedLetter
    ? games.filter(g => g.name.toUpperCase().startsWith(selectedLetter))
    : games;

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Ожидание оплаты';
      case 'paid': return 'Оплачено';
      case 'completed': return 'Завершена';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => setActiveTab('home')}>FunPay</h1>
              <div className="hidden lg:flex items-center gap-4 relative flex-1 max-w-md">
                <Input
                  placeholder="Поиск по играм..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Icon name="Search" size={18} className="absolute right-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                    <Icon name="Wallet" size={18} className="text-primary" />
                    <span className="font-bold">{user.balance} ₽</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('deals')}>
                    <Icon name="ShoppingBag" size={18} className="mr-2" />
                    Сделки
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('my-offers')}>
                    <Icon name="Package" size={18} className="mr-2" />
                    Мои товары
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <Icon name="LogOut" size={18} className="mr-2" />
                    Выход
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm">
                    <Icon name="HelpCircle" size={18} className="mr-2" />
                    Поддержка
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAuthDialog(true)}>
                    Войти
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setShowAuthDialog(true)}>
                    Регистрация
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">🎮</div>
                  <div>
                    <h2 className="text-4xl font-bold mb-2">Маркетплейс игровых ценностей</h2>
                    <p className="text-lg text-muted-foreground">{games.length}+ игр • Безопасные сделки • Гарантия возврата</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={20} className="text-primary" />
                    <span className="text-sm">Активных продавцов: 15,234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="ShoppingBag" size={20} className="text-secondary" />
                    <span className="text-sm">Предложений: {offers.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Star" size={20} className="text-yellow-500" />
                    <span className="text-sm">11,704 отзывов</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-border">
                <Button
                  variant={selectedLetter === null ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedLetter(null)}
                >
                  Все
                </Button>
                {alphabet.map(letter => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedLetter(letter)}
                    className="w-9 h-9 p-0"
                  >
                    {letter}
                  </Button>
                ))}
                {numbers.map(num => (
                  <Button
                    key={num}
                    variant={selectedLetter === num ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedLetter(num)}
                    className="w-9 h-9 p-0"
                  >
                    {num}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredGames.map(game => (
                  <Card key={game.id} className="hover-scale cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{game.image}</div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{game.name}</h3>
                      </div>
                      
                      {game.regions && game.regions.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {game.regions.map(region => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {game.categories.slice(0, 4).map((category) => (
                          <Button
                            key={category.id}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:text-primary"
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Популярные предложения</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.slice(0, 6).map(offer => (
                  <Card key={offer.id} className="hover-scale cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{offer.category}</Badge>
                            <span className="text-sm text-muted-foreground">{offer.game}</span>
                          </div>
                          <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">{offer.title}</h4>
                        </div>
                        {offer.online && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">{offer.seller}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <Icon name="Star" size={14} className="text-yellow-500" />
                            <span className="text-sm">{offer.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">{offer.price} ₽</div>
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={() => handleBuyClick(offer)}>
                          Купить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Icon name="Shield" size={48} className="text-primary mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2">Гарантия безопасности</h4>
                  <p className="text-sm text-muted-foreground">Администрация выступает гарантом каждой сделки</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Icon name="Zap" size={48} className="text-secondary mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2">Моментальная доставка</h4>
                  <p className="text-sm text-muted-foreground">Получите товар сразу после оплаты</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Icon name="Users" size={48} className="text-accent mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2">Проверенные продавцы</h4>
                  <p className="text-sm text-muted-foreground">Система рейтингов и отзывов покупателей</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'my-offers' && user && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Мои объявления</h2>
              <Button onClick={() => setShowAddOfferDialog(true)} className="bg-primary hover:bg-primary/90">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить товар
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOffers.map(offer => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' ? 'Активно' : 'Неактивно'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{offer.game}</span>
                    </div>
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <CardDescription>{offer.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">{offer.price} ₽</div>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myOffers.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Package" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">У вас пока нет объявлений</h3>
                <p className="text-muted-foreground mb-4">Создайте своё первое объявление</p>
                <Button onClick={() => setShowAddOfferDialog(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить товар
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deals' && user && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Мои сделки</h2>
            
            <div className="grid gap-4">
              {myDeals.map(deal => (
                <Card key={deal.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleOpenDeal(deal)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{deal.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Icon name="User" size={16} />
                          {deal.is_buyer ? `Продавец: ${deal.seller}` : `Покупатель: ${deal.buyer}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{deal.amount} ₽</div>
                        <Badge variant={deal.status === 'completed' ? 'default' : 'secondary'} className="mt-2">
                          {getStatusText(deal.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {deal.status === 'pending' && deal.is_buyer && (
                        <Button 
                          className="bg-secondary hover:bg-secondary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayDeal(deal.id);
                          }}
                        >
                          <Icon name="CreditCard" size={18} className="mr-2" />
                          Оплатить
                        </Button>
                      )}
                      {deal.status === 'paid' && deal.is_buyer && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteDeal(deal.id);
                          }}
                        >
                          <Icon name="Check" size={18} className="mr-2" />
                          Подтвердить получение
                        </Button>
                      )}
                      <Button variant="outline">
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Открыть чат
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myDeals.length === 0 && (
              <div className="text-center py-12">
                <Icon name="ShoppingBag" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">У вас пока нет сделок</h3>
                <p className="text-muted-foreground">Купите товар, чтобы начать сделку</p>
              </div>
            )}
          </div>
        )}
      </main>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />

      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Окно сделки</DialogTitle>
            <DialogDescription>Безопасная покупка с гарантией платформы</DialogDescription>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{selectedOffer.category}</Badge>
                  <span className="text-muted-foreground">{selectedOffer.game}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{selectedOffer.title}</h3>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Icon name="User" size={32} className="text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{selectedOffer.seller}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={14} className="text-yellow-500" />
                        <span>{selectedOffer.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">• {selectedOffer.reviews} отзывов</span>
                      {selectedOffer.online && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-green-500">Онлайн</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Цена товара:</span>
                  <span className="font-bold">{selectedOffer.price} ₽</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Комиссия платформы (5%):</span>
                  <span>{(selectedOffer.price * 0.05).toFixed(0)} ₽</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>Итого к оплате:</span>
                  <span>{(selectedOffer.price * 1.05).toFixed(0)} ₽</span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="Shield" size={24} className="text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Гарантия безопасности</div>
                    <div className="text-muted-foreground">
                      Средства зачисляются продавцу только после подтверждения получения товара. 
                      Платформа выступает гарантом сделки.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-lg py-6" onClick={handleCreateDeal}>
                  <Icon name="ShoppingCart" size={20} className="mr-2" />
                  Создать сделку
                </Button>
                <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddOfferDialog} onOpenChange={setShowAddOfferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать объявление</DialogTitle>
            <DialogDescription>Разместите свой товар на площадке</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <Label>Игра</Label>
              <Select onValueChange={(value) => setNewOffer({...newOffer, game_id: parseInt(value), category_id: 0})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите игру" />
                </SelectTrigger>
                <SelectContent>
                  {games.map(game => (
                    <SelectItem key={game.id} value={game.id.toString()}>{game.image} {game.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newOffer.game_id > 0 && (
              <div>
                <Label>Категория</Label>
                <Select onValueChange={(value) => setNewOffer({...newOffer, category_id: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.find(g => g.id === newOffer.game_id)?.categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Название</Label>
              <Input 
                value={newOffer.title}
                onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                placeholder="Например: AK-47 | Redline"
                required
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea 
                value={newOffer.description}
                onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                placeholder="Подробное описание товара"
              />
            </div>

            <div>
              <Label>Цена (₽)</Label>
              <Input 
                type="number"
                value={newOffer.price || ''}
                onChange={(e) => setNewOffer({...newOffer, price: parseInt(e.target.value)})}
                placeholder="1000"
                required
                min="1"
              />
            </div>

            <Button type="submit" className="w-full">
              Создать объявление
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Чат сделки #{selectedDeal?.id}</DialogTitle>
            <DialogDescription>{selectedDeal?.title}</DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {selectedDeal.is_buyer ? `Продавец: ${selectedDeal.seller}` : `Покупатель: ${selectedDeal.buyer}`}
                  </div>
                  <Badge variant={selectedDeal.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                    {getStatusText(selectedDeal.status)}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{selectedDeal.amount} ₽</div>
              </div>

              <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.is_own ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <div className="text-xs opacity-70 mb-1">{msg.username}</div>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Нет сообщений. Начните общение!
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
