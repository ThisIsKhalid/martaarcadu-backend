import prisma from "../../../shared/prisma";

interface DashboardParams {
  month: number; // 1-12
  year: number;
}

const getAdminDashboardData = async ({ month, year }: DashboardParams) => {
  // 1. Get total running partners count
  const totalPartners = await prisma.partner.count({
    where: {
      isVisible: true,
    },
  });

  // 2. Get sales analytics data for the current week of the specified month/year
  const now = new Date();
  const targetDate = new Date(year, month - 1, 1); // month is 0-indexed in JS

  // Find the current week within the specified month
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  // Calculate the current week number within the month (1-5)
  const currentWeekNumber = Math.ceil(
    (now.getDate() + startOfMonth.getDay()) / 7
  );
  const maxWeekNumber = Math.ceil(
    (endOfMonth.getDate() + startOfMonth.getDay()) / 7
  );
  const weekNumber = Math.min(currentWeekNumber, maxWeekNumber);

  // Calculate start and end of the target week
  const startOfWeek = new Date(
    year,
    month - 1,
    (weekNumber - 1) * 7 - startOfMonth.getDay() + 1
  );
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Group orders by day of week for the target week
  const ordersByDay = await prisma.order.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
      paymentStatus: "COMPLETED",
    },
    _sum: {
      totalPrice: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(ordersByDay)

  // Format sales data for each day of the week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesData = days.map((day) => ({
    day,
    amount: 0,
  }));

  ordersByDay.forEach((order) => {
    const dayIndex = new Date(order.createdAt).getDay(); // 0 (Sun) to 6 (Sat)
    salesData[dayIndex].amount += order._sum.totalPrice || 0;
  });

  // Find the maximum amount for percentage calculation
  const maxAmount = Math.max(...salesData.map((item) => item.amount), 1);

  // Format for the chart (percentages)
  const salesAnalytics = salesData.map((item) => ({
    day: item.day,
    percentage: maxAmount > 0 ? Math.round((item.amount / maxAmount) * 100) : 0,
  }));

  // 3. Get recent order history (last 3 orders)
  const recentOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return {
    totalPartners,
    salesAnalytics,
    recentOrders,
  };
};

export const UtilsService = {
  getAdminDashboardData,
};
