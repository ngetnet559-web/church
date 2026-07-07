import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.use(
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.TEACHER
  )
);

router.get(
  "/summary",
  asyncHandler(
    analyticsController.dashboardSummary
  )
);

router.get(
  "/users",
  asyncHandler(
    analyticsController.userAnalytics
  )
);

router.get(
  "/courses",
  asyncHandler(
    analyticsController.courseAnalytics
  )
);

router.get(
  "/attendance",
  asyncHandler(
    analyticsController.attendanceAnalytics
  )
);

router.get(
  "/certificates",
  asyncHandler(
    analyticsController.certificateAnalytics
  )
);

router.get(
  "/finance",
  asyncHandler(
    analyticsController.financeAnalytics
  )
);

router.get(
  "/members",
  asyncHandler(
    analyticsController.memberAnalytics
  )
);

router.get(
  "/charts",
  asyncHandler(
    analyticsController.charts
  )
);

router.get(
  "/dashboard",
  asyncHandler(
    analyticsController.dashboard
  )
);

router.get(
  "/enrollment-trend",
  asyncHandler(
    analyticsController.enrollmentTrend
  )
);

router.get(
  "/completion-rate",
  asyncHandler(
    analyticsController.completionRate
  )
);

router.get(
  "/attendance-rate",
  asyncHandler(
    analyticsController.attendanceRate
  )
);

router.get(
  "/donation-trend",
  asyncHandler(
    analyticsController.donationTrend
  )
);

router.get(
  "/expense-trend",
  asyncHandler(
    analyticsController.expenseTrend
  )
);

router.get(
  "/net-income",
  asyncHandler(
    analyticsController.netIncome
  )
);

router.get(
  "/top-donors",
  asyncHandler(
    analyticsController.topDonors
  )
);

router.get(
  "/top-students",
  asyncHandler(
    analyticsController.topStudents
  )
);

router.get(
  "/teacher-performance",
  asyncHandler(
    analyticsController.teacherPerformance
  )
);

router.get(
  "/certificate-trend",
  asyncHandler(
    analyticsController.certificateTrend
  )
);

router.get(
  "/member-growth",
  asyncHandler(
    analyticsController.memberGrowth
  )
);

router.get(
  "/active-users",
  asyncHandler(
    analyticsController.activeUsers
  )
);

export default router;