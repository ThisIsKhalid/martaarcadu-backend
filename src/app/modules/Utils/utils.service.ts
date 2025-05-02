import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";


interface DashboardParams {
  month: number; // 1-12
  year: number;
}

interface monthParams{
  month: number
}

const getAdminDashboardData = async ({ month, year }: DashboardParams) => {
  // 1. Get total running partners count
  const totalPartners = await prisma.partner.count({
    where: {
      isVisible: true,
    },
  });

  const totalProducts = await prisma.product.count({
    where: {
      isVisible: true,
    },
  });

  const revinue = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      paymentStatus: "COMPLETED",
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

  console.log(ordersByDay);

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
    revinue,
    totalProducts,
    salesAnalytics,
    recentOrders,
  };
};

// const getDashboardWallet = async({ month, year }: DashboardParams) => {
//   const totalProducts = await prisma.product.count({
//     where: {
//       isVisible: true
//     }
//   })

//   const totalRevinue = await prisma.order.aggregate({
//     _sum: {
//       totalPrice: true
//     },
//     where: {
//       paymentStatus: "COMPLETED"
//     }
//   })

//   const totalOrder = await prisma.order.count({
//     where: {
//       paymentStatus: "COMPLETED"
//     }

//     // Yearly Revinue
//     const years = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

//   });

//   return {
//     totalProducts,
//     totalRevinue,
//     totalOrder
//   }
// }

interface DashboardParams {
  month: number; // (not used here, but you can still accept it)
  year: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface DashboardWallet {
  totalProducts: number;
  totalRevenue: number;
  totalOrder: number;
  yearlyRevenue: number;
  monthlyRevenue: MonthlyData[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getDashboardWallet = async ({
  year,
}: DashboardParams): Promise<DashboardWallet> => {
  // 1) Total visible products
  const totalProducts = await prisma.product.count({
    where: { isVisible: true },
  });

  // 2) All-time COMPLETED revenue & count
  const allTime = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    _count: { id: true },
    where: { paymentStatus: "COMPLETED" },
  });
  const totalRevenue = allTime._sum.totalPrice ?? 0;
  const totalOrder = allTime._count.id;

  // 3) Year boundaries
  const startOfYear = new Date(year, 0, 1);
  const startOfNext = new Date(year + 1, 0, 1);

  // 4) Yearly revenue
  const thisYearAgg = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: {
      paymentStatus: "COMPLETED",
      createdAt: { gte: startOfYear, lt: startOfNext },
    },
  });
  const yearlyRevenue = thisYearAgg._sum.totalPrice ?? 0;

  // 5) Month‑wise breakdown for that year
  const ordersInYear = await prisma.order.findMany({
    where: {
      paymentStatus: "COMPLETED",
      createdAt: { gte: startOfYear, lt: startOfNext },
    },
    select: { totalPrice: true, createdAt: true },
  });

  // zero‑init 12 buckets
  const monthlyRevenue: MonthlyData[] = MONTH_NAMES.map((m) => ({
    month: m,
    amount: 0,
  }));

  // tally into each month
  ordersInYear.forEach(({ totalPrice, createdAt }) => {
    const idx = createdAt.getMonth(); // 0–11
    monthlyRevenue[idx].amount += totalPrice;
  });

  return {
    totalProducts,
    totalRevenue,
    totalOrder,
    yearlyRevenue,
    monthlyRevenue,
  };
};


const transcation = async({month}: monthParams) => {
  const transcation = await prisma.transaction.findMany({
    take: 5,                            
    orderBy: { createdAt: 'desc' },   
  })

  if(!transcation){
    throw new ApiError(httpStatus.NOT_FOUND, "Transcation not found")
  }

  return {transcation};
}

export const UtilsService = {
  getAdminDashboardData,
  getDashboardWallet,
  transcation
};
