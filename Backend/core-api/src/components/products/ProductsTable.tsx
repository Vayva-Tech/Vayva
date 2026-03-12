import { useRouter } from "next/navigation";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { Button, StatusChip, Icon } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  image?: string;
}

interface ProductsTableProps {
  products: Product[];
  nextCursor: string | null;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function ProductsTable({
  products,
  nextCursor,
  isLoadingMore,
  onLoadMore,
}: ProductsTableProps) {
  const router = useRouter();

  return (
    <div className="bg-background rounded-3xl shadow-xl shadow-black/5 border border-studio-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <table className="w-full text-left text-sm">
        <thead className="bg-studio-gray text-text-tertiary font-bold border-b border-studio-border uppercase tracking-widest text-[10px]">
          <tr>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {products.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-studio-gray transition-colors cursor-pointer group border-b border-studio-border last:border-0"
              onClick={() => router.push(`/dashboard/products/${p.id}`)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-studio-gray rounded-2xl overflow-hidden border border-studio-border shrink-0 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          name="Package"
                          size={20}
                          className="text-text-tertiary"
                        />
                      </div>
                    )}
                  </div>
                  <span className="font-black text-vayva-black text-base group-hover:translate-x-1 transition-transform">
                    {p.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-black text-vayva-black">
                  {formatCurrency(p.price, p.currency)}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusChip status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {nextCursor && (
        <div className="p-4 bg-white/30 border-t border-border/40 flex justify-center">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
