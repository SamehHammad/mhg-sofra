'use server';

import { cache } from "react";
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

export const getCatalog = cache(async (): Promise<CatalogResponse> => {
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
        const allCountries = [...dbCountries] as Country[];

        return {
            countries: allCountries,
        };
    } catch (error) {
        console.error('Error in getCatalog server action:', error);
        throw new Error('Failed to load catalog data. Please try again later.');
    }
});

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
