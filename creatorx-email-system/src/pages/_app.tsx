if (typeof window === "undefined") {
  // only run on server
  import("../workers/run-sender");
}
