'use server';

import { prisma } from "@/lib/prisma";

/**
 * Server Action to fetch catalog data (countries, banks, and cheque templates)
 * This follows Next.js 15 best practices for data fetching
 */

// Types for the catalog data structure
export interface ChequeField {
    id: string;
    type: string;
    label: string;
    position: {
        x: number;
        y: number;
    };
    style: {
        fontSize: number;
        fontFamily: string;
        alignment: string;
        rotation: number;
    };
}

export interface ChequeSchema {
    background: string;
    canvas?: {
        width: number;
        height: number;
        grid?: boolean;
    };
    fields: ChequeField[];
}

export interface ChequeTemplate {
    id: string;
    name: string;
    nameEn: string;
    version: string;
    schema: ChequeSchema;
}

export interface Bank {
    id: string;
    name: string;
    nameEn: string;
    templates: ChequeTemplate[];
}

export interface Country {
    id: string;
    name: string;
    nameEn: string;
    banks: Bank[];
}

export interface CatalogResponse {
    countries: Country[];
}

// Sample data for display with real data
// This matches the structure used in the API route
const sampleCountries = [
    {
        id: "eg",
        name: "مصر",
        nameEn: "Egypt",
        banks: [
            {
                id: "sample-nbe",
                name: "البنك الأهلي المصري",
                nameEn: "National Bank of Egypt",
                templates: [
                    {
                        id: "sample-nbe-t1",
                        name: "نموذج البنك الأهلي 2024",
                        nameEn: "NBE Template 2024",
                        version: "1.0",
                        schema: {
                            background: "/cheques/egy-ahly.jpeg",
                            fields: [
                                {
                                    "id": "date",
                                    "type": "text",
                                    "label": "التاريخ",
                                    "position": { "x": 489, "y": 3 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "beneficiary",
                                    "type": "text",
                                    "label": "ادفع لأمر",
                                    "position": { "x": 347, "y": 90 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amount",
                                    "type": "text",
                                    "label": "المبلغ (رقمي)",
                                    "position": { "x": 489, "y": 125 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amountWords",
                                    "type": "text",
                                    "label": "المبلغ (بالحروف)",
                                    "position": { "x": 187, "y": 123 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "signature",
                                    "type": "text",
                                    "label": "التوقيع",
                                    "position": { "x": 460, "y": 179 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                }
                            ],
                        },
                    },
                ],
            },
            {
                id: "sample-cib",
                name: "البنك التجاري الدولي",
                nameEn: "Commercial International Bank",
                templates: [
                    {
                        id: "sample-cib-t1",
                        name: "نموذج CIB قياسي",
                        nameEn: "CIB Standard Template",
                        version: "1.0",
                        schema: {
                            background: "/cheques/egy-cib.jpeg",
                            fields: [
                                {
                                    "id": "date",
                                    "type": "text",
                                    "label": "التاريخ",
                                    "position": { "x": 489, "y": 3 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "beneficiary",
                                    "type": "text",
                                    "label": "ادفع لأمر",
                                    "position": { "x": 347, "y": 90 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amount",
                                    "type": "text",
                                    "label": "المبلغ (رقمي)",
                                    "position": { "x": 489, "y": 125 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amountWords",
                                    "type": "text",
                                    "label": "المبلغ (بالحروف)",
                                    "position": { "x": 187, "y": 123 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "signature",
                                    "type": "text",
                                    "label": "التوقيع",
                                    "position": { "x": 460, "y": 179 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                }
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "sa",
        name: "السعودية",
        nameEn: "Saudi Arabia",
        banks: [
            {
                id: "sample-riyad",
                name: "بنك الرياض",
                nameEn: "Riyad Bank",
                templates: [
                    {
                        id: "sample-riyad-t1",
                        name: "نموذج بنك الرياض",
                        nameEn: "Riyad Bank Template",
                        version: "1.0",
                        schema: {
                            background: "/cheques/ksa-br.jpeg",
                            fields: [
                                {
                                    "id": "date",
                                    "type": "text",
                                    "label": "التاريخ",
                                    "position": { "x": 489, "y": 3 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "beneficiary",
                                    "type": "text",
                                    "label": "ادفع لأمر",
                                    "position": { "x": 347, "y": 90 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amount",
                                    "type": "text",
                                    "label": "المبلغ (رقمي)",
                                    "position": { "x": 489, "y": 125 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amountWords",
                                    "type": "text",
                                    "label": "المبلغ (بالحروف)",
                                    "position": { "x": 187, "y": 123 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "signature",
                                    "type": "text",
                                    "label": "التوقيع",
                                    "position": { "x": 460, "y": 179 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                }
                            ],
                        },
                    },
                ],
            },
            {
                id: "sample-fransi",
                name: "البنك السعودي الفرنسي",
                nameEn: "Banque Saudi Fransi",
                templates: [
                    {
                        id: "sample-fransi-t1",
                        name: "نموذج الفرنسي",
                        nameEn: "Fransi Template",
                        version: "1.0",
                        schema: {
                            background: "/cheques/ksa-fr.jpeg",
                            fields: [
                                {
                                    "id": "date",
                                    "type": "text",
                                    "label": "التاريخ",
                                    "position": { "x": 489, "y": 3 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "beneficiary",
                                    "type": "text",
                                    "label": "ادفع لأمر",
                                    "position": { "x": 347, "y": 90 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amount",
                                    "type": "text",
                                    "label": "المبلغ (رقمي)",
                                    "position": { "x": 489, "y": 125 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amountWords",
                                    "type": "text",
                                    "label": "المبلغ (بالحروف)",
                                    "position": { "x": 187, "y": 123 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "signature",
                                    "type": "text",
                                    "label": "التوقيع",
                                    "position": { "x": 460, "y": 179 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                }
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "ps",
        name: "فلسطين",
        nameEn: "Palestine",
        banks: [
            {
                id: "sample-arab",
                name: "البنك العربي",
                nameEn: "Arab Bank",
                templates: [
                    {
                        id: "sample-arab-t1",
                        name: "نموذج البنك العربي",
                        nameEn: "Arab Bank Template",
                        version: "1.0",
                        schema: {
                            background: "/cheques/ps-arabic.jpeg",
                            fields: [
                                {
                                    "id": "date",
                                    "type": "text",
                                    "label": "التاريخ",
                                    "position": { "x": 489, "y": 3 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "beneficiary",
                                    "type": "text",
                                    "label": "ادفع لأمر",
                                    "position": { "x": 347, "y": 90 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amount",
                                    "type": "text",
                                    "label": "المبلغ (رقمي)",
                                    "position": { "x": 489, "y": 125 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "amountWords",
                                    "type": "text",
                                    "label": "المبلغ (بالحروف)",
                                    "position": { "x": 187, "y": 123 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                },
                                {
                                    "id": "signature",
                                    "type": "text",
                                    "label": "التوقيع",
                                    "position": { "x": 460, "y": 179 },
                                    "style": { "fontSize": 14, "fontFamily": "Arial", "alignment": "left", "rotation": 0 }
                                }
                            ],
                        },
                    },
                ],
            },
        ],
    },
];

/**
 * Fetches the complete catalog of countries, banks, and cheque templates
 * Directly queries the database to avoid HTTP round-trip issues
 * 
 * @returns Promise<CatalogResponse> - The catalog data
 * @throws Error if the fetch fails
 */
export async function getCatalog(): Promise<CatalogResponse> {
    try {
        // get all countries with banks and templates
        const countries = await prisma.country.findMany({
            include: {
                banks: {
                    include: {
                        templates: {
                            where: {
                                isActive: true, // only active templates
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                    orderBy: {
                        nameAr: "asc",
                    },
                },
            },
            orderBy: {
                nameAr: "asc",
            },
        });

        // convert data from database to the required format
        const dbCountries = countries.map((country) => ({
            id: country.code,
            name: country.nameAr,
            nameEn: country.nameEn,
            banks: country.banks.map((bank) => ({
                id: bank.id,
                name: bank.nameAr,
                nameEn: bank.nameEn,
                templates: bank.templates.map((template) => ({
                    id: template.id,
                    name: template.nameAr,
                    nameEn: template.nameEn,
                    version: template.version,
                    schema: template.schema as unknown as ChequeSchema, // Cast JSON to ChequeSchema
                })),
            })),
        }));

        // merge data from database with samples
        // Note: We cast sampleCountries to match the Country interface structure
        const allCountries = [...dbCountries, ...sampleCountries] as Country[];

        return {
            countries: allCountries,
        };
    } catch (error) {
        console.error('Error in getCatalog server action:', error);
        throw new Error('Failed to load catalog data. Please try again later.');
    }
}

/**
 * Gets a specific bank by ID from the catalog
 * 
 * @param bankId - The ID of the bank to find
 * @returns Promise<Bank | null> - The bank data or null if not found
 */
export async function getBankById(bankId: string): Promise<Bank | null> {
    try {
        const catalog = await getCatalog();

        for (const country of catalog.countries) {
            const bank = country.banks.find(b => b.id === bankId);
            if (bank) {
                return bank;
            }
        }

        return null;
    } catch (error) {
        console.error('Error in getBankById:', error);
        return null;
    }
}

/**
 * Gets a specific template by ID from the catalog
 * 
 * @param templateId - The ID of the template to find
 * @returns Promise<ChequeTemplate | null> - The template data or null if not found
 */
export async function getTemplateById(templateId: string): Promise<ChequeTemplate | null> {
    try {
        const catalog = await getCatalog();

        for (const country of catalog.countries) {
            for (const bank of country.banks) {
                const template = bank.templates.find(t => t.id === templateId);
                if (template) {
                    return template;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error in getTemplateById:', error);
        return null;
    }
}
