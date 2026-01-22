import { getCatalog } from "@/lib/actions/catalog";
import BatchPrintingClient from "./BatchPrintingClient";


export default async function BatchPrinting() {
const catalog = await getCatalog();
  return <><BatchPrintingClient initialCatalog={catalog} /></>
}
