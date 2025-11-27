import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

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

const API_URL = 'https://functions.poehali.dev/170597f6-2ca7-4ea8-aa56-3bab0e5a86c1';

export default function Index() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
    loadOffers();
  }, []);

  const loadGames = async () => {
    try {
      const response = await fetch(`${API_URL}?action=games`);
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadOffers = async () => {
    try {
      const response = await fetch(`${API_URL}?action=offers`);
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = ['0', '2', '7', '8'];

  const filteredGames = selectedLetter
    ? games.filter(g => g.name.toUpperCase().startsWith(selectedLetter))
    : games;

  const openOfferDialog = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowOfferDialog(true);
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
              <h1 className="text-2xl font-bold text-primary">FunPay</h1>
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
              <Button variant="ghost" size="sm">
                <Icon name="HelpCircle" size={18} className="mr-2" />
                Поддержка
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Globe" size={18} className="mr-2" />
                RU
              </Button>
              <Button size="sm" variant="outline">Войти</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">Регистрация</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                      {game.categories.map((category) => (
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
              <Button variant="ghost">
                Смотреть всё <Icon name="ChevronRight" size={18} className="ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.slice(0, 6).map(offer => (
                <Card key={offer.id} className="hover-scale cursor-pointer group" onClick={() => openOfferDialog(offer)}>
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{offer.seller}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <Icon name="Star" size={14} className="text-yellow-500" />
                          <span className="text-sm">{offer.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({offer.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">{offer.price} ₽</div>
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
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
      </main>

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
                <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-lg py-6">
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  Оплатить {(selectedOffer.price * 1.05).toFixed(0)} ₽
                </Button>
                <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
