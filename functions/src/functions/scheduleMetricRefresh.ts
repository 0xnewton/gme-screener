import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getAllTokens } from "../api/db";
import { RefreshMetricsData } from "../types";
import { functions as functionsClient } from "../api/firebase";
import { REFRESH_METRICS_QUEUE_NAME } from "./refreshMetrics";

const queue = functionsClient.taskQueue(REFRESH_METRICS_QUEUE_NAME);

export const scheduleMetricRefresh = onSchedule("every 5 minutes", async () => {
  functions.logger.info("Scheduled metric refresh started");
  const allTokens = await getAllTokens();
  functions.logger.info(`Found tokens to refresh metrics`, {
    count: allTokens.length,
  });
  const enqueues: Promise<void>[] = [];
  for (const token of allTokens) {
    const payload: RefreshMetricsData = {
      mintAddress: token.mintAddress,
    };
    functions.logger.info("Enqueing refresh metrics request", {
      payload,
    });
    enqueues.push(queue.enqueue(payload));
  }

  try {
    await Promise.all(enqueues);
    functions.logger.info("All refresh metrics requests enqueued successfully");
  } catch (error) {
    functions.logger.error("Failed to enqueue refresh metrics requests", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return;
});
