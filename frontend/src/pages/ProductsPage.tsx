import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  QrCode,
  Printer,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle,
  Camera,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ProductCategory, ProductCondition } from '../types';
import type { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';
import { TableSkeleton } from '../components/ui/Skeleton';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'name'>('newest');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [printTagProduct, setPrintTagProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>(ProductCategory.FEMININO);
  const [formBrand, setFormBrand] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formCondition, setFormCondition] = useState<string>(ProductCondition.SEMINOVO_PERFEITO);
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const barcodeRef = useRef<SVGSVGElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = apiService.subscribeProducts(user.uid, (data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(ProductCategory.FEMININO);
    setFormBrand('');
    setFormSize('');
    setFormColor('');
    setFormCondition(ProductCondition.SEMINOVO_PERFEITO);
    setFormPrice('');
    setFormDescription('');
    setFormImageFile(null);
    setFormImagePreview('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormBrand(product.brand || '');
    setFormSize(product.size || '');
    setFormColor(product.color || '');
    setFormCondition(product.condition);
    setFormPrice(product.price);
    setFormDescription(product.description || '');
    setFormImagePreview(product.imageUrl || '');
    setFormImageFile(null);
    setIsFormModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImageFile(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formName || !formPrice || Number(formPrice) <= 0) {
      return addToast('error', 'Campos obrigatórios', 'Preencha o nome e um preço válido maior que zero.');
    }

    setSubmitting(true);
    try {
      let imageUrl = formImagePreview;
      if (formImageFile) {
        imageUrl = await apiService.uploadImage(formImageFile, user.uid, 'products');
      }

      if (editingProduct && editingProduct.id) {
        await apiService.updateProduct(editingProduct.id, {
          name: formName,
          category: formCategory,
          brand: formBrand,
          size: formSize,
          color: formColor,
          condition: formCondition,
          price: Number(formPrice),
          description: formDescription,
          imageUrl,
        });
        addToast('success', 'Produto atualizado!', `"${formName}" foi alterado com sucesso.`);
      } else {
        await apiService.createProduct({
          name: formName,
          category: formCategory,
          brand: formBrand,
          size: formSize,
          color: formColor,
          condition: formCondition,
          price: Number(formPrice),
          description: formDescription,
          imageUrl,
        });
        addToast('success', 'Produto cadastrado!', `"${formName}" foi adicionado ao estoque.`);
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Erro na operação', err.message || 'Falha ao salvar produto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!product.id) return;
    if (!window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) return;

    try {
      await apiService.deleteProduct(product.id);
      addToast('success', 'Produto excluído', `"${product.name}" foi removido.`);
    } catch (err: any) {
      addToast('error', 'Erro ao excluir', err.message);
    }
  };

  const handleMarkSold = async (product: Product) => {
    if (!product.id) return;
    try {
      await apiService.markProductSold(product.id);
      addToast('success', 'Status alterado', `"${product.name}" marcado como Vendido.`);
    } catch (err: any) {
      addToast('error', 'Erro ao alterar status', err.message);
    }
  };

  const handleRestore = async (product: Product) => {
    if (!product.id) return;
    try {
      await apiService.restoreProduct(product.id);
      addToast('success', 'Produto restaurado', `"${product.name}" voltou ao estoque.`);
    } catch (err: any) {
      addToast('error', 'Erro ao restaurar', err.message);
    }
  };

  useEffect(() => {
    if (barcodeModalProduct && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeModalProduct.internalCode, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }
    }
  }, [barcodeModalProduct]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setSearch(decodedText);
          addToast('info', 'Código Lido!', `Código pesquisado: ${decodedText}`);
          setIsScannerOpen(false);
          scanner?.clear();
        },
        () => {}
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isScannerOpen]);

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.internalCode.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchCondition = selectedCondition === 'ALL' || p.condition === selectedCondition;
      const matchStatus =
        selectedStatus === 'ALL'
          ? true
          : selectedStatus === 'DISPONIVEL'
          ? !p.isSold
          : p.isSold;

      return matchSearch && matchCategory && matchCondition && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return Number(b.createdAt) - Number(a.createdAt);
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Estoque de Produtos <Tag className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie o catálogo de peças, códigos de barras e etiquetas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center space-x-2 shadow-sm"
          >
            <Camera className="w-4 h-4 text-slate-500" />
            <span>Ler Código</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center space-x-2 shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, marca ou código..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Todas Categorias</option>
              {Object.values(ProductCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Todos os Status</option>
              <option value="DISPONIVEL">Disponíveis em Estoque</option>
              <option value="VENDIDO">Já Vendidos</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="newest">Mais Recentes</option>
              <option value="priceAsc">Menor Preço</option>
              <option value="priceDesc">Maior Preço</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-slate-500">Tente ajustar os filtros ou cadastrar um novo item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Peça</th>
                  <th className="p-4">Código</th>
                  <th className="p-4">Categoria / Tamanho</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                          {product.brand && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {product.internalCode}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{product.category}</div>
                      {product.size && (
                        <div className="text-xs text-slate-500">Tam: {product.size}</div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {product.condition}
                      </span>
                    </td>

                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          product.isSold
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {product.isSold ? 'VENDIDO' : 'DISPONÍVEL'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setBarcodeModalProduct(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Ver Código de Barras"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setPrintTagProduct(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Imprimir Etiqueta"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {product.isSold ? (
                          <button
                            onClick={() => handleRestore(product)}
                            className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Restaurar ao Estoque"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkSold(product)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Marcar como Vendido"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Página {page} de {totalPages} ({filteredProducts.length} itens)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Editar Peça' : 'Cadastrar Nova Peça'}
        subtitle="Preencha os detalhes para atualizar o inventário do bazar."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Nome da Peça *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Vestido Floral Midi Zara"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Categoria *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {Object.values(ProductCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="49.90"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="Ex: Farm, Zara, Nike"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Tamanho
              </label>
              <input
                type="text"
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                placeholder="P, M, G, 38, 40"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Cor
              </label>
              <input
                type="text"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                placeholder="Ex: Azul marinho"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Estado da Peça
              </label>
              <select
                value={formCondition}
                onChange={(e) => setFormCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {Object.values(ProductCondition).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Foto do Produto
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100"
                />
                {formImagePreview && (
                  <img
                    src={formImagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Descrição Adicional
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detalhes adicionais, avarias ou histórico da peça..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingProduct ? 'Atualizar Peça' : 'Salvar no Estoque'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(barcodeModalProduct)}
        onClose={() => setBarcodeModalProduct(null)}
        title="Código de Barras Interno"
        subtitle={`Identificador único para a peça "${barcodeModalProduct?.name}"`}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <svg ref={barcodeRef} className="max-w-full" />
          <div className="text-xs text-slate-500">
            Código: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{barcodeModalProduct?.internalCode}</span>
          </div>
          <button
            onClick={() => setBarcodeModalProduct(null)}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(printTagProduct)}
        onClose={() => setPrintTagProduct(null)}
        title="Imprimir Etiqueta da Peça"
        subtitle="Visualização pronta para impressão de etiqueta para roupa"
      >
        {printTagProduct && (
          <div className="space-y-6">
            <div className="printable-area border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl bg-white text-slate-900 max-w-sm mx-auto shadow-sm space-y-3 text-center">
              <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">Meu Bazar</div>
              <div className="font-bold text-lg leading-tight truncate">{printTagProduct.name}</div>
              <div className="flex items-center justify-center space-x-3 text-xs text-slate-600">
                <span>Cat: {printTagProduct.category}</span>
                {printTagProduct.size && <span>Tam: {printTagProduct.size}</span>}
              </div>
              <div className="text-2xl font-black text-slate-900 py-1">{formatCurrency(printTagProduct.price)}</div>
              <div className="pt-2 border-t border-slate-200 font-mono text-xs font-bold text-slate-700">
                {printTagProduct.internalCode}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora</span>
              </button>
              <button
                onClick={() => setPrintTagProduct(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Leitor de Código de Barras"
        subtitle="Aproxime a câmera da etiqueta ou código de barras da peça"
      >
        <div className="space-y-4">
          <div id="reader" className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900" />
          <button
            onClick={() => setIsScannerOpen(false)}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300"
          >
            Cancelar Leitura
          </button>
        </div>
      </Modal>
    </div>
  );
};
