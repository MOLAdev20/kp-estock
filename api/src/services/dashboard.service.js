import { prisma } from "../lib/prisma.js";

const toNumber = (value) => Number(value || 0);

const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getStartOfYear = (date) => new Date(date.getFullYear(), 0, 1);

const sumRevenue = async (where) => {
  const aggregate = await prisma.transaction.aggregate({
    where,
    _sum: {
      grand_total: true,
    },
  });

  return toNumber(aggregate._sum.grand_total);
};

const dashboardService = {
  getDashboardMetrics: async () => {
    const now = new Date();
    const startOfDay = getStartOfDay(now);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    const startOfMonth = getStartOfMonth(now);
    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    const startOfYear = getStartOfYear(now);
    const startOfNextYear = new Date(startOfYear);
    startOfNextYear.setFullYear(startOfNextYear.getFullYear() + 1);

    const [
      totalProducts,
      todayRevenue,
      monthlyRevenue,
      annualRevenue,
      stockProducts,
    ] = await Promise.all([
      prisma.product.count({
        where: {
          status: true,
        },
      }),
      sumRevenue({
        created_at: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
      }),
      sumRevenue({
        created_at: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      }),
      sumRevenue({
        created_at: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      }),
      prisma.product.findMany({
        where: {
          status: true,
        },
        select: {
          stock: true,
          minimum_stock: true,
        },
      }),
    ]);

    const lowStockProducts = stockProducts.filter(
      (product) => Number(product.stock) <= Number(product.minimum_stock),
    ).length;

    const [monthlyItems, annualTransactions] = await Promise.all([
      prisma.transactionItem.findMany({
        where: {
          transaction: {
            created_at: {
              gte: startOfMonth,
              lt: startOfNextMonth,
            },
          },
        },
        select: {
          qty: true,
          total: true,
          product: {
            select: {
              id: true,
              uuid: true,
              product_title: true,
            },
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          created_at: {
            gte: startOfYear,
            lt: startOfNextYear,
          },
        },
        select: {
          grand_total: true,
          created_at: true,
        },
      }),
    ]);

    const topProductMap = new Map();

    for (const item of monthlyItems) {
      const productId = item.product.id;
      const current = topProductMap.get(productId) || {
        productId,
        productUuid: item.product.uuid,
        productTitle: item.product.product_title,
        totalQty: 0,
        totalRevenue: 0,
      };

      current.totalQty += Number(item.qty);
      current.totalRevenue += toNumber(item.total);
      topProductMap.set(productId, current);
    }

    const topSellingProducts = [...topProductMap.values()]
      .sort((a, b) => {
        if (b.totalQty !== a.totalQty) {
          return b.totalQty - a.totalQty;
        }

        return b.totalRevenue - a.totalRevenue;
      })
      .slice(0, 5);

    const monthlyRevenueSeries = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      monthLabel: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
        new Date(startOfYear.getFullYear(), index, 1),
      ),
      totalRevenue: 0,
      totalTransactions: 0,
    }));

    for (const transaction of annualTransactions) {
      const monthIndex = new Date(transaction.created_at).getMonth();
      monthlyRevenueSeries[monthIndex].totalRevenue += toNumber(
        transaction.grand_total,
      );
      monthlyRevenueSeries[monthIndex].totalTransactions += 1;
    }

    return {
      summary: {
        totalProducts,
        todayRevenue,
        monthlyRevenue,
        lowStockProducts,
      },
      topSellingProducts,
      annual: {
        year: startOfYear.getFullYear(),
        totalRevenue: annualRevenue,
        monthlyRevenueSeries,
      },
    };
  },
};

export default dashboardService;
