import { ArrowLeft, Boxes, DollarSign, ImagePlus, PackageCheck, Pencil, ShieldCheck, Tag, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { useProductsStore } from '../../store/productsStore'
import type { Product } from '../../types'

function ProductActionButton({
  children,
  label,
  onClick,
  tone = 'default',
}: {
  children: ReactNode
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={[
        'inline-grid h-11 w-11 place-items-center rounded-xl border transition',
        tone === 'danger'
          ? 'border-red-400/25 bg-red-500/12 text-red-300 hover:border-red-300/60 hover:bg-red-500/20'
          : 'border-border bg-panel text-text-muted hover:border-neon/50 hover:text-neon',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Product request failed.'
}

export function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const deleteProduct = useProductsStore((state) => state.deleteProduct)
  const fetchProduct = useProductsStore((state) => state.fetchProduct)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!productId) {
      setError('Product id is missing.')
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    void fetchProduct(productId)
      .then((nextProduct) => {
        if (isMounted) {
          setProduct(nextProduct)
        }
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(getErrorMessage(fetchError))
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [fetchProduct, productId])

  const handleDelete = () => {
    if (!product) {
      return
    }

    const confirmed = window.confirm(`Delete ${product.name}? This action cannot be undone.`)

    if (!confirmed) {
      return
    }

    void deleteProduct(product.id)
      .then(() => {
        toast.success('Product deleted successfully.')
        navigate('/products')
      })
      .catch((deleteError) => toast.error(getErrorMessage(deleteError)))
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoadingState label="Loading product details..." />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/products')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </span>
        </Button>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">{error ?? 'Product was not found.'}</div>
      </div>
    )
  }

  const stockTone = product.stock > 20 ? 'In stock' : product.stock > 0 ? 'Low stock' : 'Out of stock'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/products')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <ProductActionButton label="Edit product" onClick={() => navigate(`/products?edit=${product.id}`)}>
            <Pencil className="h-4 w-4" />
          </ProductActionButton>
          <ProductActionButton label="Delete product" tone="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </ProductActionButton>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
          <div className="grid min-h-[360px] place-items-center bg-[radial-gradient(circle_at_top,_rgba(198,255,0,0.12),_transparent_55%),#111418]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full max-h-[420px] w-full object-cover" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-2xl border border-border bg-black/20 text-text-dim">
                <ImagePlus className="h-11 w-11" />
              </div>
            )}
          </div>

          <div className="space-y-8 p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge label={product.category} tone="green" />
                  <Badge label={product.status.toUpperCase()} tone={product.status === 'Active' ? 'green' : 'gray'} />
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white">{product.name}</h2>
                <p className="mt-2 text-sm text-text-muted">SKU: {product.sku}</p>
              </div>
              <div className="rounded-2xl border border-neon/30 bg-neon/10 px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-neon">Marketplace Price</p>
                <p className="mt-1 text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DetailMetric icon={<PackageCheck className="h-5 w-5" />} label="Visibility" value={product.status} />
              <DetailMetric icon={<Boxes className="h-5 w-5" />} label="Inventory" value={`${product.stock} units`} />
              <DetailMetric icon={<Tag className="h-5 w-5" />} label="Stock State" value={stockTone} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Product Positioning</h3>
              <p className="text-sm text-text-muted">Description, benefits, and marketplace messaging.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 p-5">
            <p className="text-sm leading-7 text-[#d6d6d6]">
              {product.description || 'No product description has been added yet.'}
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-dim">Key Benefits</p>
            {product.benefits?.length ? (
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((benefit) => (
                  <span key={benefit} className="rounded-full bg-[#c6ff00] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                    {benefit}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No benefits listed.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Commerce Details</h3>
              <p className="text-sm text-text-muted">Core listing and inventory metadata.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 px-5">
            <InfoRow label="Product Name" value={product.name} />
            <InfoRow label="SKU" value={product.sku} />
            <InfoRow label="Category" value={product.category} />
            <InfoRow label="Price" value={`$${product.price.toFixed(2)}`} />
            <InfoRow label="Stock Quantity" value={`${product.stock}`} />
            <InfoRow label="Product Status" value={product.status} />
          </div>
        </section>
      </div>
    </div>
  )
}
