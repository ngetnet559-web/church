import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Attendance from "../models/Attendance.js";
import AttendanceSession from "../models/AttendanceSession.js";
import Certificate from "../models/Certificate.js";
import Donation from "../models/Donation.js";
import DonationCampaign from "../models/DonationCampaign.js";
import Expense from "../models/Expense.js";
import MemberProfile from "../models/MemberProfile.js";

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

const monthNames = [
  "",
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

function getStartDate(period) {
  const now = new Date();

  switch (period) {
    case "today":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    case "week":
      return new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

    case "month":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    case "year":
      return new Date(
        now.getFullYear(),
        0,
        1
      );

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

export const getDashboardSummary = async () => {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    totalDonations,
    totalCampaigns,
    totalExpenses,
    totalProfiles,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Certificate.countDocuments(),
    Donation.countDocuments(),
    DonationCampaign.countDocuments(),
    Expense.countDocuments(),
    MemberProfile.countDocuments(),
  ]);

  return {
    users: totalUsers,
    courses: totalCourses,
    enrollments: totalEnrollments,
    certificates: totalCertificates,
    donations: totalDonations,
    campaigns: totalCampaigns,
    expenses: totalExpenses,
    profiles: totalProfiles,
  };
};

/*
|--------------------------------------------------------------------------
| User Analytics
|--------------------------------------------------------------------------
*/

export const getUserAnalytics = async () => {
  const totalUsers = await User.countDocuments();

  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: "$role",
        total: {
          $sum: 1,
        },
      },
    },
  ]);

  return {
    totalUsers,
    usersByRole,
  };
};

/*
|--------------------------------------------------------------------------
| Course Analytics
|--------------------------------------------------------------------------
*/

export const getCourseAnalytics = async () => {
  const totalCourses =
    await Course.countDocuments();

  const totalEnrollments =
    await Enrollment.countDocuments();

  const completedEnrollments =
    await Enrollment.countDocuments({
      completed: true,
    });

  return {
    totalCourses,
    totalEnrollments,
    completedEnrollments,
  };
};

/*
|--------------------------------------------------------------------------
| Attendance Analytics
|--------------------------------------------------------------------------
*/

export const getAttendanceAnalytics = async () => {
  const totalAttendance =
    await Attendance.countDocuments();

  return {
    totalAttendance,
  };
};

/*
|--------------------------------------------------------------------------
| Certificate Analytics
|--------------------------------------------------------------------------
*/

export const getCertificateAnalytics = async () => {
  const totalCertificates =
    await Certificate.countDocuments();

  return {
    totalCertificates,
  };
};

/*
|--------------------------------------------------------------------------
| Finance Analytics
|--------------------------------------------------------------------------
*/

export const getFinanceAnalytics = async () => {
  const donations = await Donation.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const expenses = await Expense.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return {
    totalDonations:
      donations[0]?.total || 0,

    totalExpenses:
      expenses[0]?.total || 0,

    balance:
      (donations[0]?.total || 0) -
      (expenses[0]?.total || 0),
  };
};

/*
|--------------------------------------------------------------------------
| Member Analytics
|--------------------------------------------------------------------------
*/

export const getMemberAnalytics = async () => {
  const totalProfiles =
    await MemberProfile.countDocuments();

  return {
    totalProfiles,
  };
};

/*
|--------------------------------------------------------------------------
| Charts
|--------------------------------------------------------------------------
*/

export async function getCharts(period = "all") {
  const startDate = getStartDate(period);

  const donationMatch = {};
  const expenseMatch = {};
  const userMatch = {};
  const enrollmentMatch = {};

  if (startDate) {
    donationMatch.donatedAt = {
      $gte: startDate,
    };

    expenseMatch.expenseDate = {
      $gte: startDate,
    };

    userMatch.createdAt = {
      $gte: startDate,
    };

    enrollmentMatch.enrolledAt = {
      $gte: startDate,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Role Distribution
  |--------------------------------------------------------------------------
  */

  const roleDistribution = [
    {
      name: "Students",
      value: await User.countDocuments({
        role: "student",
      }),
    },
    {
      name: "Teachers",
      value: await User.countDocuments({
        role: "teacher",
      }),
    },
    {
      name: "Parents",
      value: await User.countDocuments({
        role: "parent",
      }),
    },
    {
      name: "Admins",
      value: await User.countDocuments({
        role: {
          $in: [
            "admin",
            "super_admin",
          ],
        },
      }),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | User Growth
  |--------------------------------------------------------------------------
  */

  const monthlyUsers =
    await User.aggregate([
      {
        $match: userMatch,
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          users: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

  const userGrowth =
    monthlyUsers.map((item) => ({
      month:
        monthNames[item._id.month],
      users: item.users,
    }));

  /*
  |--------------------------------------------------------------------------
  | Course Popularity
  |--------------------------------------------------------------------------
  */

  const coursePopularity =
    await Enrollment.aggregate([
      {
        $match: enrollmentMatch,
      },
      {
        $group: {
          _id: "$courseId",
          students: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          _id: 0,
          course: "$course.title",
          students: 1,
        },
      },
      {
        $sort: {
          students: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

  /*
  |--------------------------------------------------------------------------
  | Donations
  |--------------------------------------------------------------------------
  */

  const donations =
    await Donation.aggregate([
      {
        $match: donationMatch,
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$donatedAt",
            },
          },
          donations: {
            $sum: "$amount",
          },
        },
      },
    ]);

  /*
  |--------------------------------------------------------------------------
  | Expenses
  |--------------------------------------------------------------------------
  */

  const expenses =
    await Expense.aggregate([
      {
        $match: expenseMatch,
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$expenseDate",
            },
          },
          expenses: {
            $sum: "$amount",
          },
        },
      },
    ]);

  /*
  |--------------------------------------------------------------------------
  | Donation vs Expense
  |--------------------------------------------------------------------------
  */

  const donationExpense = [];

  for (let i = 1; i <= 12; i++) {
    donationExpense.push({
      month: monthNames[i],
      donations:
        donations.find(
          (d) => d._id.month === i
        )?.donations || 0,
      expenses:
        expenses.find(
          (e) => e._id.month === i
        )?.expenses || 0,
    });
  }

  return {
    userGrowth,
    roleDistribution,
    coursePopularity,
    donationExpense,
  };
};

/*
|--------------------------------------------------------------------------
| Enrollment Trend
|--------------------------------------------------------------------------
*/

export const getEnrollmentTrend = async (period = "all") => {
  const startDate = getStartDate(period);
  const match = {};
  if (startDate) match.enrolledAt = { $gte: startDate };

  const data = await Enrollment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$enrolledAt" }, month: { $month: "$enrolledAt" } },
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map((item) => ({
    month: monthNames[item._id.month],
    enrollments: item.enrollments,
  }));
};

/*
|--------------------------------------------------------------------------
| Course Completion Rate
|--------------------------------------------------------------------------
*/

export const getCourseCompletionRate = async () => {
  const courses = await Course.find().lean();

  const result = await Promise.all(
    courses.map(async (course) => {
      const totalStudents = await Enrollment.countDocuments({ courseId: course._id });
      const completedStudents = await Enrollment.countDocuments({ courseId: course._id, completed: true });
      return {
        course: course.title,
        totalStudents,
        completedStudents,
        completionPercentage: totalStudents > 0
          ? Math.round((completedStudents / totalStudents) * 100)
          : 0,
      };
    }),
  );

  return result.sort((a, b) => b.completionPercentage - a.completionPercentage);
};

/*
|--------------------------------------------------------------------------
| Attendance Rate
|--------------------------------------------------------------------------
*/

export const getAttendanceRate = async (period = "all") => {
  const startDate = getStartDate(period);
  const match = {};
  if (startDate) match.checkInTime = { $gte: startDate };

  const data = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
        excused: { $sum: { $cond: [{ $eq: ["$status", "Excused"] }, 1, 0] } },
      },
    },
  ]);

  if (!data[0] || data[0].total === 0) {
    return { overallAttendance: 0, present: 0, absent: 0, late: 0, excused: 0 };
  }

  return {
    overallAttendance: Math.round((data[0].present / data[0].total) * 100),
    present: data[0].present,
    absent: data[0].absent,
    late: data[0].late,
    excused: data[0].excused,
  };
};

/*
|--------------------------------------------------------------------------
| Donation Trends
|--------------------------------------------------------------------------
*/

function getDateGroupStage(field, groupBy) {
  switch (groupBy) {
    case "day":
      return {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${field}` } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      };
    case "week":
      return {
        $group: {
          _id: { year: { $isoWeekYear: `$${field}` }, week: { $isoWeek: `$${field}` } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      };
    case "month":
      return {
        $group: {
          _id: { year: { $year: `$${field}` }, month: { $month: `$${field}` } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      };
    case "year":
      return {
        $group: {
          _id: { year: { $year: `$${field}` } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      };
    default:
      return {
        $group: {
          _id: { year: { $year: `$${field}` }, month: { $month: `$${field}` } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      };
  }
}

function formatDateGroup(item, groupBy) {
  switch (groupBy) {
    case "day":
      return { date: item._id, amount: item.amount, count: item.count };
    case "week":
      return { period: `W${item._id.week}-${item._id.year}`, amount: item.amount, count: item.count };
    case "month":
      return { period: `${monthNames[item._id.month]} ${item._id.year}`, amount: item.amount, count: item.count };
    case "year":
      return { period: String(item._id.year), amount: item.amount, count: item.count };
    default:
      return { period: `${monthNames[item._id.month]} ${item._id.year}`, amount: item.amount, count: item.count };
  }
}

export const getDonationTrend = async (groupBy = "month") => {
  const data = await Donation.aggregate([
    getDateGroupStage("donatedAt", groupBy),
  ]);

  return data.map((item) => formatDateGroup(item, groupBy));
};

/*
|--------------------------------------------------------------------------
| Expense Trends
|--------------------------------------------------------------------------
*/

export const getExpenseTrend = async (groupBy = "month") => {
  const data = await Expense.aggregate([
    getDateGroupStage("expenseDate", groupBy),
  ]);

  return data.map((item) => formatDateGroup(item, groupBy));
};

/*
|--------------------------------------------------------------------------
| Net Income Trend
|--------------------------------------------------------------------------
*/

export const getNetIncomeTrend = async (period = "all") => {
  const startDate = getStartDate(period);
  const donationMatch = {};
  const expenseMatch = {};
  if (startDate) {
    donationMatch.donatedAt = { $gte: startDate };
    expenseMatch.expenseDate = { $gte: startDate };
  }

  const [donations, expenses] = await Promise.all([
    Donation.aggregate([
      { $match: donationMatch },
      {
        $group: {
          _id: { year: { $year: "$donatedAt" }, month: { $month: "$donatedAt" } },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } },
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const now = new Date();
  const result = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const income = donations.find((item) => item._id.month === month && item._id.year === year)?.total || 0;
    const expense = expenses.find((item) => item._id.month === month && item._id.year === year)?.total || 0;
    result.push({
      month: monthNames[month],
      income,
      expense,
      balance: income - expense,
    });
  }
  return result;
};

/*
|--------------------------------------------------------------------------
| Top Donors
|--------------------------------------------------------------------------
*/

export const getTopDonors = async (limit = 10) => {
  const data = await Donation.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$donorName", "Anonymous"] },
        amount: { $sum: "$amount" },
        donationCount: { $sum: 1 },
      },
    },
    { $sort: { amount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        name: "$_id",
        amount: 1,
        donationCount: 1,
      },
    },
  ]);

  return data;
};

/*
|--------------------------------------------------------------------------
| Most Active Students
|--------------------------------------------------------------------------
*/

export const getMostActiveStudents = async (limit = 10) => {
  const students = await User.find({ role: "STUDENT" }).lean();

  const scores = await Promise.all(
    students.map(async (student) => {
      const [attendanceData, enrollmentData] = await Promise.all([
        Attendance.aggregate([
          { $match: { studentId: student._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
            },
          },
        ]),
        Enrollment.aggregate([
          { $match: { userId: student._id } },
          {
            $group: {
              _id: null,
              avgProgress: { $avg: "$progress" },
              completed: { $sum: { $cond: ["$completed", 1, 0] } },
              total: { $sum: 1 },
            },
          },
        ]),
      ]);

      const totalAttendance = attendanceData[0]?.total || 0;
      const presentAttendance = attendanceData[0]?.present || 0;
      const attendanceRate = totalAttendance > 0 ? presentAttendance / totalAttendance : 0;
      const avgProgress = enrollmentData[0]?.avgProgress || 0;
      const completedCourses = enrollmentData[0]?.completed || 0;
      const totalCourses = enrollmentData[0]?.total || 0;

      const progressScore = totalCourses > 0 ? (avgProgress / 100) * 30 : 0;
      const completionScore = totalCourses > 0 ? (completedCourses / totalCourses) * 30 : 0;
      const score = Math.round(attendanceRate * 40 + progressScore + completionScore);

      return {
        name: student.name,
        email: student.email,
        attendanceRate: Math.round(attendanceRate * 100),
        averageProgress: Math.round(avgProgress),
        completedCourses,
        score,
      };
    }),
  );

  return scores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
};

/*
|--------------------------------------------------------------------------
| Teacher Performance
|--------------------------------------------------------------------------
*/

export const getTeacherPerformance = async () => {
  const teachers = await User.find({ role: "TEACHER" }).lean();

  const result = await Promise.all(
    teachers.map(async (teacher) => {
      const courses = await Course.find({ createdBy: teacher._id }).lean();
      const courseIds = courses.map((c) => c._id);

      if (courseIds.length === 0) {
        return {
          teacher: teacher.name,
          courses: 0,
          students: 0,
          completionPercentage: 0,
          averageAttendance: 0,
        };
      }

      const [totalEnrollments, completedEnrollments, students, sessionData] = await Promise.all([
        Enrollment.countDocuments({ courseId: { $in: courseIds } }),
        Enrollment.countDocuments({ courseId: { $in: courseIds }, completed: true }),
        Enrollment.distinct("userId", { courseId: { $in: courseIds } }),
        (async () => {
          const sessions = await AttendanceSession.find({ courseId: { $in: courseIds } }).lean();
          const sessionIds = sessions.map((s) => s._id);
          if (sessionIds.length === 0) return { total: 0, present: 0 };
          const agg = await Attendance.aggregate([
            { $match: { sessionId: { $in: sessionIds } } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
              },
            },
          ]);
          return agg[0] || { total: 0, present: 0 };
        })(),
      ]);

      return {
        teacher: teacher.name,
        courses: courseIds.length,
        students: students.length,
        completionPercentage: totalEnrollments > 0
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0,
        averageAttendance: sessionData.total > 0
          ? Math.round((sessionData.present / sessionData.total) * 100)
          : 0,
      };
    }),
  );

  return result.sort((a, b) => b.completionPercentage - a.completionPercentage);
};

/*
|--------------------------------------------------------------------------
| Certificates Issued By Month
|--------------------------------------------------------------------------
*/

export const getCertificatesIssuedByMonth = async (period = "all") => {
  const startDate = getStartDate(period);
  const match = {};
  if (startDate) match.issuedDate = { $gte: startDate };

  const data = await Certificate.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$issuedDate" }, month: { $month: "$issuedDate" } },
        certificates: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map((item) => ({
    month: `${monthNames[item._id.month]} ${item._id.year}`,
    certificates: item.certificates,
  }));
};

/*
|--------------------------------------------------------------------------
| Member Growth
|--------------------------------------------------------------------------
*/

export const getMemberGrowth = async (period = "all") => {
  const startDate = getStartDate(period);
  const match = {};
  if (startDate) match.createdAt = { $gte: startDate };

  const data = await User.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        users: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map((item) => ({
    month: monthNames[item._id.month],
    users: item.users,
  }));
};

/*
|--------------------------------------------------------------------------
| Active Users
|--------------------------------------------------------------------------
*/

export const getActiveUsers = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [recentUsers, recentAttendance, recentEnrollments] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Attendance.distinct("studentId", { checkInTime: { $gte: thirtyDaysAgo } }),
    Enrollment.distinct("userId", { enrolledAt: { $gte: thirtyDaysAgo } }),
  ]);

  const activeIds = new Set([
    ...recentAttendance.map((id) => id.toString()),
    ...recentEnrollments.map((id) => id.toString()),
  ]);

  return {
    total: recentUsers + activeIds.size,
    newUsers: recentUsers,
    activeStudents: recentAttendance.length,
    activeEnrollments: recentEnrollments.length,
  };
};

/*
|--------------------------------------------------------------------------
| Dashboard KPIs
|--------------------------------------------------------------------------
*/

export const getDashboardKPIs = async (period = "all") => {
  const startDate = getStartDate(period);
  const attendanceMatch = {};
  const donationMatch = {};
  const expenseMatch = {};
  if (startDate) {
    attendanceMatch.checkInTime = { $gte: startDate };
    donationMatch.donatedAt = { $gte: startDate };
    expenseMatch.expenseDate = { $gte: startDate };
  }

  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalParents,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    totalProfiles,
    attendanceData,
    donationData,
    expenseData,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "TEACHER" }),
    User.countDocuments({ role: "PARENT" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Certificate.countDocuments(),
    MemberProfile.countDocuments(),
    Attendance.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        },
      },
    ]),
    Donation.aggregate([
      { $match: donationMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const attendanceRate = attendanceData[0]?.total
    ? Math.round((attendanceData[0].present / attendanceData[0].total) * 100)
    : 0;
  const revenue = donationData[0]?.total || 0;
  const expenses = expenseData[0]?.total || 0;

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalParents,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    attendanceRate,
    revenue,
    expenses,
    netIncome: revenue - expenses,
    totalProfiles,
  };
};