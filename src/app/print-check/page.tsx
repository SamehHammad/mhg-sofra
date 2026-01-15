import { getCatalog } from '@/lib/actions/catalog';
import PrintCheckClient from './PrintCheckClient';

export const dynamic = 'force-dynamic';

export default async function PrintCheckPage() {
    // Fetch data on the server
    const catalogData = await getCatalog();

    // Log the result to the server console as requested
    console.log('Server-side catalog data:', JSON.stringify(catalogData, null, 2));

    return (
        <PrintCheckClient initialCountries={catalogData.countries} />
    );
}
