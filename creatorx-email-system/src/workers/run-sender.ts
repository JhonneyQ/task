import { journeyEvaluator } from "./journey";
import { senderLoop } from "./sender";

const DEMO_MODE = process.env.ACCELERATE_MODE === "true";

// every 10s in demo, or every 10min in prod
const LOOP_INTERVAL = DEMO_MODE ? 10 * 1000 : 10 * 60 * 100;

async function runJobs() {
  console.log("⏳ Running background jobs...");

  // 1. Evaluate journeys → enqueue new emails
  await journeyEvaluator();

  // 2. Process pending emails
  await senderLoop();

  console.log("✅ Background cycle complete");
}

// Run immediately once on boot
runJobs();

// Repeat forever
setInterval(runJobs, LOOP_INTERVAL);

console.log(`🚀 Background jobs running every ${LOOP_INTERVAL / 1000}s`);
