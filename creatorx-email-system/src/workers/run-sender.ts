import { senderLoop } from "./sender";

const LOOP_INTERVAL = 15 * 1000; // every 15s (adjust as needed)

// Run immediately once
senderLoop();

// Run repeatedly
setInterval(senderLoop, LOOP_INTERVAL);

console.log(`🚀 Sender loop running every ${LOOP_INTERVAL / 1000}s`);
