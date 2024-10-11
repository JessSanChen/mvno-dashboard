'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SelectTranscript } from '@/lib/db'; // Make sure to import the correct type
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TranscriptsTable({
  transcripts,
  offset,
  totalTranscripts
}: {
  transcripts: SelectTranscript[];
  offset: number;
  totalTranscripts: number;
}) {
  let router = useRouter();
  let transcriptsPerPage = 5;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcripts</CardTitle>
        <CardDescription>
          Manage and analyze call transcripts across your enterprise network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Callers</TableHead>
              <TableHead>Transcript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcripts.map((transcript) => (
              <TableRow key={transcript.id}>
                <td>{new Date(transcript.startTime).toLocaleString()}</td>
                <td>{new Date(transcript.endTime).toLocaleString()}</td>
                <td>{transcript.duration}</td>
                <td>{transcript.callers || 'N/A'}</td>
                <td className="truncate max-w-[200px]">{transcript.transcript}</td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.min(offset - transcriptsPerPage, totalTranscripts) + 1}-{offset}
            </strong>{' '}
            of <strong>{totalTranscripts}</strong> transcripts
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === transcriptsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + transcriptsPerPage > totalTranscripts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}


// 'use client';

// import {
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   Table
// } from '@/components/ui/table';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Product } from './product';
// import { SelectProduct } from '@/lib/db';
// import { useRouter } from 'next/navigation';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export function ProductsTable({
//   products,
//   offset,
//   totalProducts
// }: {
//   products: SelectProduct[];
//   offset: number;
//   totalProducts: number;
// }) {
//   let router = useRouter();
//   let productsPerPage = 5;

//   function prevPage() {
//     router.back();
//   }

//   function nextPage() {
//     router.push(`/?offset=${offset}`, { scroll: false });
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Transcripts</CardTitle>
//         <CardDescription>
//           Manage and analyze call transcripts across your enterprise network.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="hidden w-[100px] sm:table-cell">
//                 <span className="sr-only">Image</span>
//               </TableHead>
//               <TableHead>Name</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="hidden md:table-cell">Price</TableHead>
//               <TableHead className="hidden md:table-cell">
//                 Total Sales
//               </TableHead>
//               <TableHead className="hidden md:table-cell">Created at</TableHead>
//               <TableHead>
//                 <span className="sr-only">Actions</span>
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => (
//               <Product key={product.id} product={product} />
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//       <CardFooter>
//         <form className="flex items-center w-full justify-between">
//           <div className="text-xs text-muted-foreground">
//             Showing{' '}
//             <strong>
//               {Math.min(offset - productsPerPage, totalProducts) + 1}-{offset}
//             </strong>{' '}
//             of <strong>{totalProducts}</strong> products
//           </div>
//           <div className="flex">
//             <Button
//               formAction={prevPage}
//               variant="ghost"
//               size="sm"
//               type="submit"
//               disabled={offset === productsPerPage}
//             >
//               <ChevronLeft className="mr-2 h-4 w-4" />
//               Prev
//             </Button>
//             <Button
//               formAction={nextPage}
//               variant="ghost"
//               size="sm"
//               type="submit"
//               disabled={offset + productsPerPage > totalProducts}
//             >
//               Next
//               <ChevronRight className="ml-2 h-4 w-4" />
//             </Button>
//           </div>
//         </form>
//       </CardFooter>
//     </Card>
//   );
// }
