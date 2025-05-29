import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
// import { GoogleAuth } from "google-auth-library";
import { getAllTokens } from "../api/db";
import { RefreshMetricsData } from "../types";
// import { getFunctions } from "firebase-admin/functions";
import { functions as functionsClient } from "../api/firebase";

// let auth = new GoogleAuth({
//   scopes: "https://www.googleapis.com/auth/cloud-platform",
// });
// const REFRESH_METRICS_FUNCTION_NAME = "refreshMetrics";
const queue = functionsClient.taskQueue("refreshMetrics");

export const scheduleMetricRefresh = onSchedule("every 5 minutes", async () => {
  functions.logger.info("Scheduled metric refresh started");
  const allTokens = await getAllTokens();
  functions.logger.info(`Found tokens to refresh metrics`, {
    count: allTokens.length,
  });
  // const queue = getFunctions().taskQueue(REFRESH_METRICS_FUNCTION_NAME);
  // const targetUri = await getFunctionUrl(REFRESH_METRICS_FUNCTION_NAME);

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

// const getFunctionUrl = async (
//   name: string,
//   location = "us-central1"
// ): Promise<string> => {
//   if (!auth) {
//     auth = new GoogleAuth({
//       scopes: "https://www.googleapis.com/auth/cloud-platform",
//     });
//   }
//   const projectId = await auth.getProjectId();
//   const url =
//     "https://cloudfunctions.googleapis.com/v2beta/" +
//     `projects/${projectId}/locations/${location}/functions/${name}`;

//   const client = await auth.getClient();
//   const res = (await client.request({ url })) as any;
//   const uri = res.data?.serviceConfig?.uri;
//   if (!uri) {
//     throw new Error(`Unable to retreive uri for function at ${url}`);
//   }
//   return uri as string;
// };
