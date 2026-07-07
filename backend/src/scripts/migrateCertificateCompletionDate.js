import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sunday-school";

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB\n");

  // --- Step 1: Fix certificates missing completedAt ---
  const missingCompletedAt = await Certificate.find({
    $or: [
      { completedAt: { $exists: false } },
      { completedAt: null },
    ],
  });
  console.log(`Certificates missing completedAt: ${missingCompletedAt.length}`);

  let completedAtFixed = 0;
  let completedAtFallback = 0;

  for (const cert of missingCompletedAt) {
    const enrollment = await Enrollment.findOne({
      userId: cert.studentId,
      courseId: cert.courseId,
    });

    if (enrollment?.completedAt) {
      cert.completedAt = enrollment.completedAt;
      completedAtFixed++;
    } else {
      cert.completedAt = cert.issuedDate;
      completedAtFallback++;
    }

    await cert.save();
  }

  console.log(`  - ${completedAtFixed} recovered from enrollment`);
  console.log(`  - ${completedAtFallback} fallback to issuedDate`);
  console.log();

  // --- Step 2: Fix certificates missing courseId ---
  const missingCourse = await Certificate.find({
    $or: [
      { courseId: { $exists: false } },
      { courseId: null },
    ],
  });
  console.log(`Certificates missing courseId: ${missingCourse.length}`);

  let courseFixed = 0;
  let courseSkipped = 0;

  for (const cert of missingCourse) {
    const enrollment = await Enrollment.findOne({
      userId: cert.studentId,
    }).sort({ enrolledAt: -1 });

    if (enrollment?.courseId) {
      const course = await Course.findById(enrollment.courseId);
      cert.courseId = enrollment.courseId;
      courseFixed++;

      if (!cert.completedAt) {
        cert.completedAt = enrollment.completedAt || cert.issuedDate;
      }

      await cert.save();
    } else {
      courseSkipped++;
      console.log(`  WARN: No enrollment found for certificate ${cert._id} (student ${cert.studentId})`);
    }
  }

  console.log(`  - ${courseFixed} recovered from enrollment`);
  console.log(`  - ${courseSkipped} skipped (no enrollment found)`);
  console.log();

  // --- Step 3: Verify integrity ---
  const total = await Certificate.countDocuments();
  const stillMissingCompletedAt = await Certificate.countDocuments({
    $or: [
      { completedAt: { $exists: false } },
      { completedAt: null },
    ],
  });
  const stillMissingCourse = await Certificate.countDocuments({
    $or: [
      { courseId: { $exists: false } },
      { courseId: null },
    ],
  });

  console.log("Verification:");
  console.log(`  Total certificates: ${total}`);
  console.log(`  Still missing completedAt: ${stillMissingCompletedAt}`);
  console.log(`  Still missing courseId: ${stillMissingCourse}`);

  await mongoose.disconnect();
  console.log("\nMigration complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
