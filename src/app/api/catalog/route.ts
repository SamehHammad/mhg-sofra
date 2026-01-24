import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



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
    const allCountries = [...dbCountries];

    const response = {
      countries: allCountries,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json({ error: "فشل في جلب الكتالوج" }, { status: 500 });
  }
}
