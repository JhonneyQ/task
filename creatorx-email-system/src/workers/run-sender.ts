import { senderLoop } from "./sender";

const LOOP_INTERVAL = 15 * 1000; // 15s

senderLoop(); // run once at startup
setInterval(senderLoop, LOOP_INTERVAL);
