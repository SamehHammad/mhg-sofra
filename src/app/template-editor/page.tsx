import TemplateEditorClient from "./TemplateEditorClient";
import { getCatalog } from "@/lib/actions/catalog";

export default async function TemplateEditor() {
  const catalog = await getCatalog();
  return <TemplateEditorClient initialCountries={catalog.countries} />;
}
