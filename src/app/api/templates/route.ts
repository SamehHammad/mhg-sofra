import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/templates
 * Create a new cheque template
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankId, nameAr, nameEn, version, schema } = body;

    // Validation
    if (!bankId || !nameAr || !nameEn || !version || !schema) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if bank exists
    const bank = await prisma.bank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return NextResponse.json(
        { error: "Bank not found" },
        { status: 404 }
      );
    }

    // Create template
    const template = await prisma.chequeTemplate.create({
      data: {
        bankId,
        nameAr,
        nameEn,
        version,
        schema: schema,
        isActive: true,
      },
      include: {
        bank: {
          include: {
            country: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Template created successfully",
        template: {
          id: template.id,
          nameAr: template.nameAr,
          nameEn: template.nameEn,
          version: template.version,
          bankName: template.bank.nameAr,
          bankNameEn: template.bank.nameEn,
          countryName: template.bank.country.nameAr,
          countryNameEn: template.bank.country.nameEn,
          createdAt: template.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      {
        error: "Failed to create template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/templates
 * Get all templates or filter by bankId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get("bankId");

    const templates = await prisma.chequeTemplate.findMany({
      where: bankId ? { bankId, isActive: true } : { isActive: true },
      include: {
        bank: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: templates.length,
      templates: templates.map((template :any) => ({
        id: template.id,
        nameAr: template.nameAr,
        nameEn: template.nameEn,
        version: template.version,
        schema: template.schema,
        bankName: template.bank.nameAr,
        bankNameEn: template.bank.nameEn,
        countryName: template.bank.country.nameAr,
        countryNameEn: template.bank.country.nameEn,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates
 * Update an existing template
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameAr, nameEn, version, schema, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.chequeTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Update template
    const template = await prisma.chequeTemplate.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn && { nameEn }),
        ...(version && { version }),
        ...(schema && { schema }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        bank: {
          include: {
            country: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      template: {
        id: template.id,
        nameAr: template.nameAr,
        nameEn: template.nameEn,
        version: template.version,
        bankName: template.bank.nameAr,
        bankNameEn: template.bank.nameEn,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates
 * Soft delete a template (set isActive to false)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.chequeTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
