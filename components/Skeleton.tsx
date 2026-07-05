export function ProductCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="h-6 w-20 skeleton" />
          <div className="h-9 w-9 rounded-full skeleton" />
        </div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-4 w-64 skeleton mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 skeleton rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-5 w-20 skeleton" />
          <div className="h-10 w-3/4 skeleton" />
          <div className="h-20 w-full skeleton" />
          <div className="h-8 w-32 skeleton" />
          <div className="h-12 w-20 skeleton" />
          <div className="h-14 w-full skeleton rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-32 skeleton mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="w-20 h-20 skeleton rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 skeleton" />
                <div className="h-5 w-16 skeleton" />
              </div>
              <div className="h-8 w-24 skeleton rounded-full" />
              <div className="h-5 w-20 skeleton" />
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-6 h-fit space-y-4">
          <div className="h-6 w-24 skeleton" />
          <div className="space-y-2">
            <div className="flex justify-between"><div className="h-4 w-16 skeleton" /><div className="h-4 w-20 skeleton" /></div>
            <div className="flex justify-between"><div className="h-4 w-16 skeleton" /><div className="h-4 w-20 skeleton" /></div>
          </div>
          <div className="flex justify-between"><div className="h-5 w-12 skeleton" /><div className="h-6 w-24 skeleton" /></div>
          <div className="h-12 w-full skeleton rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div>
      <div className="min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-36">
          <div className="max-w-2xl space-y-6">
            <div className="h-6 w-48 skeleton rounded-full" />
            <div className="h-16 w-full skeleton" />
            <div className="h-24 w-3/4 skeleton" />
            <div className="flex gap-4">
              <div className="h-12 w-36 skeleton rounded-full" />
              <div className="h-12 w-36 skeleton rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrderSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="h-10 w-64 skeleton mx-auto" />
        <div className="h-5 w-96 skeleton mx-auto" />
        <div className="h-14 w-full skeleton rounded-full" />
      </div>
    </div>
  )
}
