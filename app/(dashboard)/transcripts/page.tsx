import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranscriptsTable } from './products-table'; // Update to use TranscriptsTable
import { getTranscripts, insertTranscript } from '@/lib/db'; // Update to use getTranscripts

export default async function TranscriptsPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  
  // Fetch transcripts using the getTranscripts function
  const { transcripts, newOffset, totalTranscripts } = await getTranscripts(
    search,
    Number(offset)
  );

  return (
    <TranscriptsTable
      transcripts={transcripts}
      offset={newOffset ?? 0}
      totalTranscripts={totalTranscripts}
    />
  );
}


// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { File, PlusCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ProductsTable } from './products-table';
// import { getProducts } from '@/lib/db';

// export default async function ProductsPage({
//   searchParams
// }: {
//   searchParams: { q: string; offset: string };
// }) {
//   const search = searchParams.q ?? '';
//   const offset = searchParams.offset ?? 0;
//   const { products, newOffset, totalProducts } = await getProducts(
//     search,
//     Number(offset)
//   );
//   return (
//     <ProductsTable
//           products={products}
//           offset={newOffset ?? 0}
//           totalProducts={totalProducts}
//     />
//   );
// }


