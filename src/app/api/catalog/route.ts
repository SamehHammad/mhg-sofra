import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sample data for display with real data
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
                { id: "amount", x: 100, y: 50, fontSize: 14 },
                { id: "beneficiary", x: 100, y: 100, fontSize: 14 },
                { id: "date", x: 100, y: 150, fontSize: 12 },
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
                { id: "amount", x: 120, y: 60, fontSize: 14 },
                { id: "beneficiary", x: 120, y: 110, fontSize: 14 },
                { id: "date", x: 120, y: 160, fontSize: 12 },
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
                { id: "amount", x: 110, y: 55, fontSize: 14 },
                { id: "beneficiary", x: 110, y: 105, fontSize: 14 },
                { id: "date", x: 110, y: 155, fontSize: 12 },
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
                { id: "amount", x: 115, y: 65, fontSize: 14 },
                { id: "beneficiary", x: 115, y: 115, fontSize: 14 },
                { id: "date", x: 115, y: 165, fontSize: 12 },
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
                { id: "amount", x: 105, y: 58, fontSize: 14 },
                { id: "beneficiary", x: 105, y: 108, fontSize: 14 },
                { id: "date", x: 105, y: 158, fontSize: 12 },
              ],
            },
          },
        ],
      },
    ],
  },
];

export async function GET() {
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
          schema: template.schema,
        })),
      })),
    }));

    // merge data from database with samples
    const allCountries = [...dbCountries, ...sampleCountries];

    const response = {
      countries: allCountries,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json({ error: "فشل في جلب الكتالوج" }, { status: 500 });
  }
}
