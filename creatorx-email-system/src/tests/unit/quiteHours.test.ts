// import { describe, it, expect } from "vitest";
// import { isWithinQuietHours } from "./quietHours";

// // Example implementation you should already have
// // export function isWithinQuietHours(date: Date): boolean {
// //   const hour = date.getUTCHours();
// //   return hour < 8 || hour >= 20; // 8 AM–8 PM UTC allowed
// // }

// describe("isWithinQuietHours", () => {
//   it("returns true during quiet hours (2am)", () => {
//     const d = new Date("2024-01-01T02:00:00Z");
//     expect(isWithinQuietHours(d)).toBe(true);
//   });

//   it("returns false during allowed hours (10am)", () => {
//     const d = new Date("2024-01-01T10:00:00Z");
//     expect(isWithinQuietHours(d)).toBe(false);
//   });

//   it("returns true at edge case (9pm)", () => {
//     const d = new Date("2024-01-01T21:00:00Z");
//     expect(isWithinQuietHours(d)).toBe(true);
//   });
// });
