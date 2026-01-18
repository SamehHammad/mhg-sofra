import { getCatalog } from '@/lib/actions/catalog';
import PrintCheckClient from './PrintCheckClient';

export default async function PrintCheckPage() {
    // Fetch data on the server
    const catalogData = await getCatalog();

    return (
        <PrintCheckClient initialCountries={catalogData.countries} />
    );
}
