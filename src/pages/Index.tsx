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
  sku: string;
  name: string;
  price: number;
  category: string;
  icon: string;
}

interface CartItem extends Product {
  qty: number;
}

const DEFAULT_PIN = '1234';
const PIN_STORAGE_KEY = 'pos_pin';
const getPin = () => localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;

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

const ICONS = ['Coffee', 'Cookie', 'CakeSlice', 'Croissant', 'Sandwich', 'Salad', 'CupSoda', 'GlassWater', 'Apple', 'Pizza', 'IceCream', 'Beef', 'Box'];

/* ─── PIN Screen ─── */
const PinScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    if (next.length === 4) {
      if (next === getPin()) {
        setTimeout(onUnlock, 200);
      } else {
        setShake(true);
        setTimeout(() => { setInput(''); setShake(false); }, 600);
      }
    }
  };

  const del = () => setInput((v) => v.slice(0, -1));

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-10 animate-fade-in">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Icon name="Zap" className="text-primary-foreground" size={28} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Касса</h1>
        <p className="text-sm text-muted-foreground mt-1">Введите PIN-код для входа</p>
      </div>

      <div className="flex gap-4" style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${i < input.length ? 'bg-primary border-primary scale-110' : 'border-border bg-transparent'}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-64">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button key={d} onClick={() => press(d)} className="h-16 rounded-2xl bg-card border border-border text-xl font-medium hover:bg-secondary hover:border-primary active:scale-95 transition-all">{d}</button>
        ))}
        <div />
        <button onClick={() => press('0')} className="h-16 rounded-2xl bg-card border border-border text-xl font-medium hover:bg-secondary hover:border-primary active:scale-95 transition-all">0</button>
        <button onClick={del} className="h-16 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-secondary active:scale-95 transition-all">
          <Icon name="Delete" size={22} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main App ─── */
const Index = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [section, setSection] = useState<Section>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Catalog state
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', price: '', category: '', icon: 'Box' });
  const [posSearch, setPosSearch] = useState('');

  // Call staff
  const [callOpen, setCallOpen] = useState(false);
  const [callEmail, setCallEmail] = useState('');
  const [callMsg, setCallMsg] = useState('');
  const [callSending, setCallSending] = useState(false);
  const [callDone, setCallDone] = useState(false);
  const [callError, setCallError] = useState('');

  const sendCall = async () => {
    if (!callEmail) { setCallError('Введите email'); return; }
    setCallSending(true);
    setCallError('');
    try {
      const res = await fetch('https://functions.poehali.dev/0238b0d3-e6af-46b1-8496-ec12e4125318', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: callMsg || 'Требуется помощь на кассе', cashier: 'Анна Петрова', location: 'Касса №1', email: callEmail }),
      });
      if (!res.ok) throw new Error();
      setCallDone(true);
      setTimeout(() => { setCallOpen(false); setCallDone(false); setCallEmail(''); setCallMsg(''); }, 2000);
    } catch {
      setCallError('Ошибка отправки. Проверьте настройки SMTP.');
    } finally {
      setCallSending(false);
    }
  };

  // Settings PIN
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ current: '', next: '', confirm: '' });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [search, products]);

  const filteredPos = useMemo(() => {
    const q = posSearch.toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [posSearch, products]);

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
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  };

  const checkout = () => { if (cart.length) setReceiptOpen(true); };
  const newSale = () => { setCart([]); setReceiptOpen(false); };
  const receiptNo = useMemo(() => Math.floor(10000 + Math.random() * 89999), [receiptOpen]);

  const genSku = () => 'SKU-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const createProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const p: Product = {
      id: Date.now(),
      sku: newProduct.sku || genSku(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category || 'Прочее',
      icon: newProduct.icon,
    };
    setProducts((prev) => [...prev, p]);
    setNewProduct({ sku: '', name: '', price: '', category: '', icon: 'Box' });
    setCreateOpen(false);
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((c) => c.filter((i) => i.id !== id));
    setDeleteId(null);
  };

  const deleteAllProducts = () => {
    setProducts([]);
    setCart([]);
    setDeleteAllOpen(false);
  };

  const savePin = () => {
    setPinError('');
    if (pinForm.current !== getPin()) { setPinError('Текущий PIN неверный'); return; }
    if (pinForm.next.length !== 4) { setPinError('PIN должен быть 4 цифры'); return; }
    if (pinForm.next !== pinForm.confirm) { setPinError('PIN-коды не совпадают'); return; }
    localStorage.setItem(PIN_STORAGE_KEY, pinForm.next);
    setPinSuccess(true);
    setPinForm({ current: '', next: '', confirm: '' });
    setTimeout(() => { setPinSuccess(false); setPinChangeOpen(false); }, 1500);
  };

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

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
                section === n.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon name={n.icon} size={20} className="shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold shrink-0">АП</div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium leading-tight">Анна Петрова</p>
              <p className="text-xs text-muted-foreground">Администратор</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">

        {/* POS */}
        {section === 'pos' && (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="h-20 flex items-center gap-4 px-6 lg:px-8 border-b border-border">
                <div className="shrink-0">
                  <h1 className="text-xl font-semibold tracking-tight">Новая продажа</h1>
                  <p className="text-sm text-muted-foreground">Выберите товары</p>
                </div>
                <div className="flex-1 relative">
                  <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Поиск по названию, категории или артикулу…"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                  />
                  {posSearch && (
                    <button onClick={() => setPosSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="X" size={16} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm font-mono shrink-0">
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  Смена открыта
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-4">
                {products.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Icon name="Package" size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Товары не добавлены</p>
                    <p className="text-sm mt-1">Перейдите в Настройки, чтобы добавить товары</p>
                    <Button variant="outline" className="mt-6 gap-2" onClick={() => setSection('settings')}>
                      <Icon name="Settings" size={16} />
                      Перейти в Настройки
                    </Button>
                  </div>
                ) : filteredPos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Icon name="SearchX" size={40} className="mb-3 opacity-30" />
                    <p className="font-medium">Ничего не найдено</p>
                    <p className="text-sm mt-1">Попробуйте другой запрос</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPos.map((p, i) => (
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
                )}
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
                  <button onClick={() => setCart([])} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
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
                    <div key={i.id} className="animate-slide-in-right flex items-center gap-3 p-3 rounded-xl bg-secondary">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{i.price} ₽</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => change(i.id, -1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                          <Icon name="Minus" size={14} />
                        </button>
                        <span className="w-6 text-center font-mono font-medium">{i.qty}</span>
                        <button onClick={() => change(i.id, 1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                          <Icon name="Plus" size={14} />
                        </button>
                      </div>
                      <p className="w-16 text-right font-mono font-semibold text-sm">{i.price * i.qty} ₽</p>
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
                <Button onClick={checkout} disabled={!cart.length} className="w-full h-14 text-base rounded-xl gap-2">
                  <Icon name="CreditCard" size={20} />
                  Оплатить
                </Button>
                <button
                  onClick={() => { setCallOpen(true); setCallDone(false); setCallError(''); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:border-destructive hover:text-destructive transition-all"
                >
                  <Icon name="BellRing" size={16} />
                  Вызвать сотрудника
                </button>
              </div>
            </div>
          </>
        )}

        {/* CATALOG */}
        {section === 'catalog' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-border">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
                <p className="text-sm text-muted-foreground">{products.length} позиций</p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
              {products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Icon name="Package" size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Каталог пуст</p>
                  <p className="text-sm mt-1">Добавьте товары через раздел Настройки</p>
                  <Button variant="outline" className="mt-6 gap-2" onClick={() => setSection('settings')}>
                    <Icon name="Settings" size={16} />
                    Перейти в Настройки
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  {products.map((p) => (
                    <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                        <Icon name={p.icon} size={24} fallback="Box" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku} · {p.category}</p>
                      </div>
                      <p className="font-mono font-semibold">{p.price} ₽</p>
                      <button onClick={() => setDeleteId(p.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {section === 'users' && (
          <SectionPanel title="Пользователи" subtitle="Управление доступом сотрудников">
            <div className="max-w-3xl space-y-3">
              {USERS.map((u) => (
                <div key={u.name} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold shrink-0">{u.initials}</div>
                  <div className="flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.role}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-sm ${u.status === 'Онлайн' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.status === 'Онлайн' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionPanel>
        )}

        {/* SETTINGS */}
        {section === 'settings' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-20 flex items-center px-6 lg:px-8 border-b border-border">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Настройки</h1>
                <p className="text-sm text-muted-foreground">Конфигурация системы и параметры кассы</p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
              <div className="max-w-2xl space-y-6">

                {/* Товары */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Управление товарами</p>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Поиск по товарам…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name="X" size={16} />
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  {search && (
                    <div className="space-y-2 mb-3">
                      {filteredCatalog.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-1">Ничего не найдено</p>
                      ) : filteredCatalog.map((p) => (
                        <div key={p.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                            <Icon name={p.icon} size={20} fallback="Box" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.sku} · {p.category}</p>
                          </div>
                          <p className="font-mono text-sm font-semibold">{p.price} ₽</p>
                          <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="flex-1 flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon name="Plus" size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Создать товар</p>
                        <p className="text-xs text-muted-foreground">Добавить в каталог</p>
                      </div>
                    </button>

                    <button
                      onClick={() => products.length > 0 && setDeleteAllOpen(true)}
                      disabled={products.length === 0}
                      className="flex-1 flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-destructive hover:shadow-md transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon name="Trash2" size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Удалить все</p>
                        <p className="text-xs text-muted-foreground">{products.length} товаров</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Система */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Система</p>
                  <div className="space-y-3">
                    {[
                      { icon: 'Store', label: 'Название точки', value: 'Кофейня №1' },
                      { icon: 'Percent', label: 'Ставка НДС', value: '20%' },
                      { icon: 'Banknote', label: 'Валюта', value: 'Рубль ₽' },
                      { icon: 'Printer', label: 'Принтер чеков', value: 'Подключён' },
                      { icon: 'Receipt', label: 'Автопечать чека', value: 'Включена' },
                    ].map((s) => (
                      <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <Icon name={s.icon} size={22} fallback="Settings" />
                        </div>
                        <p className="flex-1 font-medium">{s.label}</p>
                        <span className="font-mono text-sm text-muted-foreground">{s.value}</span>
                        <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                      </div>
                    ))}

                    <div
                      className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => { setPinChangeOpen(true); setPinError(''); setPinSuccess(false); }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <Icon name="KeyRound" size={22} fallback="Settings" />
                      </div>
                      <p className="flex-1 font-medium">PIN-код входа</p>
                      <span className="font-mono text-sm text-muted-foreground">Изменить</span>
                      <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="sr-only"><DialogTitle>Чек</DialogTitle></DialogHeader>
          <div className="print-receipt bg-card p-6 font-mono text-sm">
            <div className="text-center mb-4">
              <p className="font-sans font-bold text-base">КОФЕЙНЯ №1</p>
              <p className="text-xs text-muted-foreground">Кассовый чек</p>
            </div>
            <div className="border-t border-dashed border-border pt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Чек №</span><span>{receiptNo}</span></div>
              <div className="flex justify-between"><span>Кассир</span><span>Анна П.</span></div>
              <div className="flex justify-between"><span>Дата</span><span>{new Date().toLocaleDateString('ru-RU')}</span></div>
            </div>
            <div className="border-t border-dashed border-border my-3" />
            <div className="space-y-1.5">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="truncate">{i.name} ×{i.qty}</span>
                  <span>{i.price * i.qty} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-border my-3" />
            <div className="flex justify-between font-sans font-bold text-base">
              <span>ИТОГО</span><span>{total} ₽</span>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">Спасибо за покупку!</p>
          </div>
          <div className="no-print flex gap-2 p-4 border-t border-border">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
              <Icon name="Printer" size={18} />Печать
            </Button>
            <Button className="flex-1 gap-2" onClick={newSale}>
              <Icon name="Check" size={18} />Готово
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Новый товар</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Артикул (SKU)</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-secondary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SKU-XXXXX"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct((v) => ({ ...v, sku: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setNewProduct((v) => ({ ...v, sku: genSku() }))}
                  className="px-4 py-3 rounded-xl border border-border bg-secondary text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                >
                  Авто
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Оставьте пустым — артикул сгенерируется автоматически</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Название</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Например: Американо"
                value={newProduct.name}
                onChange={(e) => setNewProduct((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Цена (₽)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="150"
                value={newProduct.price}
                onChange={(e) => setNewProduct((v) => ({ ...v, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Категория</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Кофе, Еда, Напитки…"
                value={newProduct.category}
                onChange={(e) => setNewProduct((v) => ({ ...v, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Иконка</label>
              <div className="grid grid-cols-7 gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setNewProduct((v) => ({ ...v, icon: ic }))}
                    className={`h-10 rounded-xl flex items-center justify-center transition-all ${newProduct.icon === ic ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'}`}
                  >
                    <Icon name={ic} size={20} fallback="Box" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Отмена</Button>
              <Button className="flex-1" onClick={createProduct} disabled={!newProduct.name || !newProduct.price}>
                Создать товар
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Staff Dialog */}
      <Dialog open={callOpen} onOpenChange={setCallOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon name="BellRing" size={20} className="text-destructive" />Вызов сотрудника</DialogTitle></DialogHeader>
          {callDone ? (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Check" size={28} className="text-primary" />
              </div>
              <p className="font-semibold">Вызов отправлен!</p>
              <p className="text-sm text-muted-foreground">Письмо отправлено на указанный email</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email для уведомления</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="manager@mail.ru"
                  value={callEmail}
                  onChange={(e) => setCallEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Сообщение <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Требуется помощь на кассе"
                  value={callMsg}
                  onChange={(e) => setCallMsg(e.target.value)}
                />
              </div>
              {callError && <p className="text-sm text-destructive">{callError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setCallOpen(false)}>Отмена</Button>
                <Button variant="destructive" className="flex-1 gap-2" onClick={sendCall} disabled={callSending}>
                  {callSending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="BellRing" size={16} />}
                  {callSending ? 'Отправка…' : 'Вызвать'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete One Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить товар?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground pt-1">
            Товар «{products.find((p) => p.id === deleteId)?.name}» будет удалён из каталога и корзины.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId && deleteProduct(deleteId)}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить все товары?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground pt-1">
            Все {products.length} товаров будут удалены из каталога. Корзина также будет очищена.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteAllOpen(false)}>Отмена</Button>
            <Button variant="destructive" className="flex-1" onClick={deleteAllProducts}>Удалить все</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Change Dialog */}
      <Dialog open={pinChangeOpen} onOpenChange={setPinChangeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Изменить PIN-код</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {(['current', 'next', 'confirm'] as const).map((field, idx) => (
              <div key={field}>
                <label className="text-sm font-medium mb-1.5 block">
                  {idx === 0 ? 'Текущий PIN' : idx === 1 ? 'Новый PIN' : 'Повторите PIN'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary tracking-[0.5em] font-mono"
                  placeholder="····"
                  value={pinForm[field]}
                  onChange={(e) => setPinForm((v) => ({ ...v, [field]: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            ))}
            {pinError && <p className="text-sm text-destructive">{pinError}</p>}
            {pinSuccess && <p className="text-sm text-primary font-medium">PIN успешно изменён!</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPinChangeOpen(false)}>Отмена</Button>
              <Button className="flex-1" onClick={savePin}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SectionPanel = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div className="flex-1 flex flex-col overflow-hidden">
    <header className="h-20 flex items-center px-6 lg:px-8 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">{children}</div>
  </div>
);

export default Index;