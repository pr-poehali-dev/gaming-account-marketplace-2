import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Listing {
  id: number;
  title: string;
  category: string;
  game: string;
  price: number;
  seller: string;
  rating: number;
  image: string;
}

interface Deal {
  id: number;
  title: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed';
  buyer?: string;
  seller?: string;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showAddListingDialog, setShowAddListingDialog] = useState(false);
  const [balance] = useState(15420);

  const listings: Listing[] = [
    { id: 1, title: 'Аккаунт Steam 200+ игр', category: 'Аккаунты', game: 'Steam', price: 5000, seller: 'GameMaster', rating: 4.9, image: '🎮' },
    { id: 2, title: 'CS2 - Нож Karambit', category: 'Предметы', game: 'CS2', price: 12000, seller: 'ProTrader', rating: 5.0, image: '🔪' },
    { id: 3, title: 'Ключ Cyberpunk 2077', category: 'Ключи', game: 'Cyberpunk', price: 1500, seller: 'KeySeller', rating: 4.8, image: '🔑' },
    { id: 4, title: 'Аккаунт Dota 2 Ancient', category: 'Аккаунты', game: 'Dota 2', price: 3000, seller: 'DotaPro', rating: 4.7, image: '⚔️' },
    { id: 5, title: 'GTA V Online 1 млрд $', category: 'Услуги', game: 'GTA V', price: 2500, seller: 'MoneyBoost', rating: 4.9, image: '💰' },
    { id: 6, title: 'Valorant - Phantom Skin', category: 'Предметы', game: 'Valorant', price: 800, seller: 'SkinShop', rating: 4.6, image: '🎯' },
  ];

  const activeDeals: Deal[] = [
    { id: 1, title: 'Аккаунт WoW', amount: 8000, status: 'pending', buyer: 'Вы', seller: 'EpicGamer' },
    { id: 2, title: 'Ключ Elden Ring', amount: 2000, status: 'paid', buyer: 'NewPlayer', seller: 'Вы' },
  ];

  const openDealDialog = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDealDialog(true);
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Ожидание оплаты';
      case 'paid': return 'Оплачено, ждём подтверждения';
      case 'completed': return 'Завершена';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary">GameTrade</h1>
              <nav className="hidden md:flex gap-6">
                <Button variant="ghost" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-primary' : ''}>
                  <Icon name="Home" size={18} className="mr-2" />
                  Главная
                </Button>
                <Button variant="ghost" onClick={() => setActiveTab('catalog')} className={activeTab === 'catalog' ? 'text-primary' : ''}>
                  <Icon name="Grid3x3" size={18} className="mr-2" />
                  Каталог
                </Button>
                <Button variant="ghost" onClick={() => setActiveTab('deals')} className={activeTab === 'deals' ? 'text-primary' : ''}>
                  <Icon name="ShoppingBag" size={18} className="mr-2" />
                  Мои сделки
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddListingDialog(true)} className="bg-accent hover:bg-accent/90">
                <Icon name="Plus" size={18} className="mr-2" />
                Разместить
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('profile')}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>ПК</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 md:p-12">
              <h2 className="text-4xl font-bold mb-4">Безопасная торговля игровыми товарами</h2>
              <p className="text-lg text-muted-foreground mb-6">Покупайте и продавайте аккаунты, ключи и предметы с гарантией</p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90" onClick={() => setActiveTab('catalog')}>
                  <Icon name="Search" size={20} className="mr-2" />
                  Найти товар
                </Button>
                <Button size="lg" variant="outline" onClick={() => setShowAddListingDialog(true)}>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Разместить объявление
                </Button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Популярные предложения</h3>
                <Button variant="ghost" onClick={() => setActiveTab('catalog')}>
                  Смотреть всё <Icon name="ChevronRight" size={18} className="ml-2" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map(listing => (
                  <Card key={listing.id} className="hover-scale cursor-pointer group" onClick={() => openDealDialog(listing)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-4xl mb-2">{listing.image}</div>
                        <Badge variant="secondary">{listing.category}</Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{listing.title}</CardTitle>
                      <CardDescription>{listing.game}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-primary">{listing.price} ₽</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Icon name="User" size={14} />
                            {listing.seller}
                            <Icon name="Star" size={14} className="ml-2 text-yellow-500" />
                            {listing.rating}
                          </div>
                        </div>
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                          Купить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Icon name="Shield" size={32} className="text-primary mb-2" />
                  <CardTitle>Гарантия безопасности</CardTitle>
                  <CardDescription>Администрация выступает гарантом каждой сделки</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Icon name="Zap" size={32} className="text-secondary mb-2" />
                  <CardTitle>Быстрые сделки</CardTitle>
                  <CardDescription>Моментальная передача товаров после оплаты</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Icon name="Users" size={32} className="text-accent mb-2" />
                  <CardTitle>Проверенные продавцы</CardTitle>
                  <CardDescription>Система рейтингов и отзывов от покупателей</CardDescription>
                </CardHeader>
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4">
              <Input placeholder="Поиск по названию..." className="md:flex-1" />
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="accounts">Аккаунты</SelectItem>
                  <SelectItem value="items">Предметы</SelectItem>
                  <SelectItem value="keys">Ключи</SelectItem>
                  <SelectItem value="services">Услуги</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Игра" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все игры</SelectItem>
                  <SelectItem value="cs2">CS2</SelectItem>
                  <SelectItem value="dota2">Dota 2</SelectItem>
                  <SelectItem value="steam">Steam</SelectItem>
                  <SelectItem value="valorant">Valorant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <Card key={listing.id} className="hover-scale cursor-pointer group" onClick={() => openDealDialog(listing)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{listing.image}</div>
                      <Badge variant="secondary">{listing.category}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{listing.title}</CardTitle>
                    <CardDescription>{listing.game}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">{listing.price} ₽</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Icon name="User" size={14} />
                          {listing.seller}
                          <Icon name="Star" size={14} className="ml-2 text-yellow-500" />
                          {listing.rating}
                        </div>
                      </div>
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                        Купить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Мои активные сделки</h2>
            <div className="grid gap-4">
              {activeDeals.map(deal => (
                <Card key={deal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{deal.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Icon name="User" size={16} />
                          Покупатель: {deal.buyer} • Продавец: {deal.seller}
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
                      {deal.status === 'pending' && (
                        <Button className="bg-secondary hover:bg-secondary/90">
                          <Icon name="CreditCard" size={18} className="mr-2" />
                          Оплатить
                        </Button>
                      )}
                      {deal.status === 'paid' && (
                        <Button variant="outline">
                          <Icon name="MessageCircle" size={18} className="mr-2" />
                          Чат со {deal.buyer === 'Вы' ? 'продавцом' : 'покупателем'}
                        </Button>
                      )}
                      <Button variant="outline">
                        <Icon name="FileText" size={18} className="mr-2" />
                        Детали сделки
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl">ПК</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">Личный кабинет</CardTitle>
                    <CardDescription>Управление аккаунтом и балансом</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-primary/10">
                    <CardHeader>
                      <CardDescription>Баланс</CardDescription>
                      <CardTitle className="text-3xl text-primary">{balance.toLocaleString()} ₽</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-secondary hover:bg-secondary/90">
                        <Icon name="Plus" size={18} className="mr-2" />
                        Пополнить
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardDescription>Завершённых сделок</CardDescription>
                      <CardTitle className="text-3xl">127</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardDescription>Рейтинг продавца</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        4.8 <Icon name="Star" size={24} className="text-yellow-500" />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-bold mb-4">Настройки</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Имя пользователя</Label>
                      <Input value="GameMaster2024" className="mt-2" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value="gamer@example.com" type="email" className="mt-2" />
                    </div>
                    <Button>Сохранить изменения</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Помощь и поддержка</CardTitle>
                <CardDescription>Есть вопросы? Мы готовы помочь!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="MessageCircle" size={18} className="mr-2" />
                  Чат с поддержкой
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="HelpCircle" size={18} className="mr-2" />
                  База знаний
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Shield" size={18} className="mr-2" />
                  Правила безопасности
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Окно сделки</DialogTitle>
            <DialogDescription>Безопасная покупка с гарантией администрации</DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-6xl">{selectedListing.image}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedListing.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Badge variant="secondary">{selectedListing.category}</Badge>
                    <span>•</span>
                    <span>{selectedListing.game}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    <span className="font-medium">{selectedListing.seller}</span>
                    <Icon name="Star" size={16} className="ml-2 text-yellow-500" />
                    <span>{selectedListing.rating}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Цена товара:</span>
                  <span className="font-bold">{selectedListing.price} ₽</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Комиссия платформы (5%):</span>
                  <span>{(selectedListing.price * 0.05).toFixed(0)} ₽</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>Итого к оплате:</span>
                  <span>{(selectedListing.price * 1.05).toFixed(0)} ₽</span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="Shield" size={24} className="text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Гарантия безопасности</div>
                    <div className="text-muted-foreground">
                      Средства зачисляются продавцу только после подтверждения получения товара. 
                      Администрация выступает гарантом сделки.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-lg py-6">
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  Оплатить {(selectedListing.price * 1.05).toFixed(0)} ₽
                </Button>
                <Button variant="outline" onClick={() => setShowDealDialog(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddListingDialog} onOpenChange={setShowAddListingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Разместить объявление</DialogTitle>
            <DialogDescription>Заполните информацию о товаре для продажи</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название товара</Label>
              <Input placeholder="Например: Аккаунт Steam с GTA V" className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Категория</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">Аккаунты</SelectItem>
                    <SelectItem value="items">Предметы</SelectItem>
                    <SelectItem value="keys">Ключи</SelectItem>
                    <SelectItem value="services">Услуги</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Игра</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите игру" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steam">Steam</SelectItem>
                    <SelectItem value="cs2">CS2</SelectItem>
                    <SelectItem value="dota2">Dota 2</SelectItem>
                    <SelectItem value="valorant">Valorant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea placeholder="Подробно опишите товар..." className="mt-2 min-h-32" />
            </div>
            <div>
              <Label>Цена (₽)</Label>
              <Input type="number" placeholder="5000" className="mt-2" />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-2">Комиссия платформы</div>
              <div className="text-muted-foreground">
                При продаже товара платформа удерживает комиссию 5% от суммы сделки за гарантию безопасности.
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-accent hover:bg-accent/90">
                <Icon name="Plus" size={18} className="mr-2" />
                Опубликовать объявление
              </Button>
              <Button variant="outline" onClick={() => setShowAddListingDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}