import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('sam7@123', 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: adminPasswordHash,
        },
    });

    console.log('✅ Admin user created:', admin.username);

    // Create sample restaurants
    const restaurant1 = await prisma.restaurant.create({
        data: {
            name: 'مطعم الأصالة',
            phone: '0501234567',
            deliveryPrice: 15,
            menuItems: {
                create: [
                    {
                        name: 'فول مدمس',
                        price: 12,
                        mealType: 'BREAKFAST',
                        description: 'فول مدمس بالطحينة والليمون',
                    },
                    {
                        name: 'شكشوكة',
                        price: 18,
                        mealType: 'BREAKFAST',
                        description: 'بيض بالطماطم والفلفل',
                    },
                    {
                        name: 'كبسة دجاج',
                        price: 35,
                        mealType: 'LUNCH',
                        description: 'كبسة دجاج مع الأرز البسمتي',
                    },
                    {
                        name: 'مندي لحم',
                        price: 45,
                        mealType: 'LUNCH',
                        description: 'مندي لحم مع الأرز',
                    },
                ],
            },
        },
    });

    const restaurant2 = await prisma.restaurant.create({
        data: {
            name: 'مطعم النخيل',
            phone: '0507654321',
            deliveryPrice: 20,
            menuItems: {
                create: [
                    {
                        name: 'مشاوي مشكلة',
                        price: 55,
                        mealType: 'DINNER',
                        description: 'مشاوي لحم ودجاج',
                    },
                    {
                        name: 'سمك مشوي',
                        price: 48,
                        mealType: 'DINNER',
                        description: 'سمك طازج مشوي',
                    },
                ],
            },
        },
    });

    const restaurant3 = await prisma.restaurant.create({
        data: {
            name: 'حلويات السعادة',
            phone: '0509876543',
            deliveryPrice: 10,
            menuItems: {
                create: [
                    {
                        name: 'كنافة نابلسية',
                        price: 25,
                        mealType: 'DESSERT',
                        description: 'كنافة بالجبنة والقطر',
                    },
                    {
                        name: 'بسبوسة',
                        price: 20,
                        mealType: 'DESSERT',
                        description: 'بسبوسة بالقشطة',
                    },
                    {
                        name: 'أم علي',
                        price: 22,
                        mealType: 'DESSERT',
                        description: 'حلى أم علي بالمكسرات',
                    },
                ],
            },
        },
    });

    console.log('✅ Sample restaurants created');
    console.log('  -', restaurant1.name);
    console.log('  -', restaurant2.name);
    console.log('  -', restaurant3.name);

    // Create sample users
    const user1 = await prisma.user.create({
        data: {
            username: 'أحمد',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            username: 'محمد',
        },
    });

    console.log('✅ Sample users created');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
