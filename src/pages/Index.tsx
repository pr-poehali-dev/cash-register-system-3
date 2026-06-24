import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Section = 'pos' | 'catalog' | 'users' | 'settings';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
}

interface CartItem extends Product {
  qty: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Эспрессо', price: 120, category: 'Кофе', icon: 'Coffee' },
  { id: 2, name: 'Капучино', price: 180, category: 'Кофе', icon: 'Coffee' },
  { id: 3, name: 'Латте', price: 200, category: 'Кофе', icon: 'Coffee' },
  { id: 4, name: 'Раф', price: 240, category: 'Кофе', icon: 'Coffee' },
  { id: 5, name: 'Круассан', price: 150, category: 'Выпечка', icon: 'Croissant' },
  { id: 6, name: 'Чизкейк', price: 290, category: 'Выпечка', icon: 'CakeSlice' },
  { id: 7, name: 'Маффин', price: 130, category: 'Выпечка', icon: 'Cookie' },
  { id: 8, name: 'Сэндвич', price: 320, category: 'Еда', icon: 'Sandwich' },
  { id: 9, name: 'Салат', price: 350, category: 'Еда', icon: 'Salad' },
  { id: 10, name: 'Сок апельсин', price: 160, category: 'Напитки', icon: 'CupSoda' },
  { id: 11, name: 'Вода', price: 80, category: 'Напитки', icon: 'GlassWater' },
  { id: 12, name: 'Чай', price: 110, category: 'Напитки', icon: 'CupSoda' },
];

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'pos', label: 'Касса', icon: 'ShoppingCart' },
  { id: 'catalog', label: 'Товары', icon: 'Package' },
  { id: 'users', label: 'Пользователи', icon: 'Users' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const USERS = [
  { name: 'Анна Петрова', role: 'Администратор', status: 'Онлайн', initials: 'АП' },
  { name: 'Иван Сидоров', role: 'Кассир', status: 'Онлайн', initials: 'ИС' },
  { name: 'Мария Котова', role: 'Кассир', status: 'Офлайн', initials: 'МК' },
  { name: 'Дмитрий Лебедев', role: 'Менеджер', status: 'Офлайн', initials: 'ДЛ' },
];

const Index = () => {
  const [section, setSection] = useState<Section>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCat, setActiveCat] = useState('Все');
  const [receiptOpen, setReceiptOpen] = useState(false);

  const categories = ['Все', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

  const filtered = useMemo(
    () => (activeCat === 'Все' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCat)),
    [activeCat],
  );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const add = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, qty: 1 }];
    });
  };

  const change = (id: number, d: number) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const checkout = () => {
    if (!cart.length) return;
    setReceiptOpen(true);
  };

  const newSale = () => {
    setCart([]);
    setReceiptOpen(false);
  };

  const receiptNo = useMemo(() => Math.floor(10000 + Math.random() * 89999), [receiptOpen]);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-border bg-card shrink-0">
        <div className="h-20 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Icon name="Zap" className="text-primary-foreground" size={22} />
          </div>
          <div className="hidden lg:block">
            <p className="font-semibold leading-tight">Касса</p>
            <p className="text-xs text-muted-foreground">POS-система</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all ${
                section === n.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon name={n.icon} size={20} className="shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold shrink-0">
              АП
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium leading-tight">Анна Петрова</p>
              <p className="text-xs text-muted-foreground">Администратор</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {section === 'pos' && (
          <>
            {/* Products */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-border">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Новая продажа</h1>
                  <p className="text-sm text-muted-foreground">Выберите товары</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm font-mono">
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  Смена открыта
                </div>
              </header>

              <div className="px-6 lg:px-8 pt-5 flex gap-2 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCat === c
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-5">
                <div className="space-y-3">
                  {filtered.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => add(p)}
                      style={{ animationDelay: `${i * 30}ms` }}
                      className="animate-fade-in group w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary hover:shadow-lg transition-all active:scale-[0.99]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon name={p.icon} size={24} fallback="Box" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium leading-tight truncate">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.category}</p>
                      </div>
                      <p className="font-mono font-semibold text-lg shrink-0">{p.price} ₽</p>
                      <div className="w-9 h-9 rounded-lg bg-secondary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center shrink-0 transition-colors">
                        <Icon name="Plus" size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="w-80 xl:w-96 flex flex-col border-l border-border bg-card shrink-0">
              <header className="h-20 flex items-center justify-between px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon name="ReceiptText" size={20} />
                  <h2 className="font-semibold">Корзина</h2>
                </div>
                {count > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Icon name="ShoppingCart" size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Корзина пуста</p>
                    <p className="text-xs">Нажмите на товар, чтобы добавить</p>
                  </div>
                ) : (
                  cart.map((i) => (
                    <div
                      key={i.id}
                      className="animate-slide-in-right flex items-center gap-3 p-3 rounded-xl bg-secondary"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{i.price} ₽</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => change(i.id, -1)}
                          className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Icon name="Minus" size={14} />
                        </button>
                        <span className="w-6 text-center font-mono font-medium">{i.qty}</span>
                        <button
                          onClick={() => change(i.id, 1)}
                          className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Icon name="Plus" size={14} />
                        </button>
                      </div>
                      <p className="w-16 text-right font-mono font-semibold text-sm">
                        {i.price * i.qty} ₽
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-border space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Позиций</span>
                  <span className="font-mono">{count}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">Итого</span>
                  <span className="font-mono font-bold text-2xl">{total} ₽</span>
                </div>
                <Button
                  onClick={checkout}
                  disabled={!cart.length}
                  className="w-full h-14 text-base rounded-xl gap-2"
                >
                  <Icon name="CreditCard" size={20} />
                  Оплатить
                </Button>
              </div>
            </div>
          </>
        )}

        {section === 'catalog' && (
          <SectionPanel title="Товары" subtitle="Каталог и управление товарами">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Icon name={p.icon} size={24} fallback="Box" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.category}</p>
                  </div>
                  <p className="font-mono font-semibold">{p.price} ₽</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        )}

        {section === 'users' && (
          <SectionPanel title="Пользователи" subtitle="Управление доступом сотрудников">
            <div className="max-w-3xl space-y-3">
              {USERS.map((u) => (
                <div
                  key={u.name}
                  className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold shrink-0">
                    {u.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.role}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 text-sm ${
                      u.status === 'Онлайн' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.status === 'Онлайн' ? 'bg-primary' : 'bg-muted-foreground/40'
                      }`}
                    />
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionPanel>
        )}

        {section === 'settings' && (
          <SectionPanel title="Настройки" subtitle="Конфигурация системы и параметры кассы">
            <div className="max-w-2xl space-y-3">
              {[
                { icon: 'Store', label: 'Название точки', value: 'Кофейня №1' },
                { icon: 'Percent', label: 'Ставка НДС', value: '20%' },
                { icon: 'Banknote', label: 'Валюта', value: 'Рубль ₽' },
                { icon: 'Printer', label: 'Принтер чеков', value: 'Подключён' },
                { icon: 'Receipt', label: 'Автопечать чека', value: 'Включена' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon name={s.icon} size={22} fallback="Settings" />
                  </div>
                  <p className="flex-1 font-medium">{s.label}</p>
                  <span className="font-mono text-sm text-muted-foreground">{s.value}</span>
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </SectionPanel>
        )}
      </main>

      {/* Receipt dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Чек</DialogTitle>
          </DialogHeader>
          <div className="print-receipt bg-card p-6 font-mono text-sm">
            <div className="text-center mb-4">
              <p className="font-sans font-bold text-base">КОФЕЙНЯ №1</p>
              <p className="text-xs text-muted-foreground">Кассовый чек</p>
            </div>
            <div className="border-t border-dashed border-border pt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Чек №</span>
                <span>{receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Кассир</span>
                <span>Анна П.</span>
              </div>
              <div className="flex justify-between">
                <span>Дата</span>
                <span>{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-border my-3" />
            <div className="space-y-1.5">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {i.name} ×{i.qty}
                  </span>
                  <span>{i.price * i.qty} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-border my-3" />
            <div className="flex justify-between font-sans font-bold text-base">
              <span>ИТОГО</span>
              <span>{total} ₽</span>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Спасибо за покупку!
            </p>
          </div>
          <div className="no-print flex gap-2 p-4 border-t border-border">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
              <Icon name="Printer" size={18} />
              Печать
            </Button>
            <Button className="flex-1 gap-2" onClick={newSale}>
              <Icon name="Check" size={18} />
              Готово
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SectionPanel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="flex-1 flex flex-col overflow-hidden">
    <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">{children}</div>
  </div>
);

export default Index;