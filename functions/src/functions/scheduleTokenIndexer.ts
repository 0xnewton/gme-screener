import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { createToken, getToken } from "../api/db";
import { RefreshMetricsData, Token } from "../types";
import { functions as functionsClient } from "../api/firebase";
import { getGMETokens, PumpFunCoin } from "../api/pumpfun";
import { REFRESH_METRICS_QUEUE_NAME } from "./refreshMetrics";

const queue = functionsClient.taskQueue(REFRESH_METRICS_QUEUE_NAME);

export const scheduleTokenIndexer = onSchedule("every 5 minutes", async () => {
  functions.logger.info("Scheduled backup indexer");
  const allTokens = await getGMETokens();
  functions.logger.info(`Found tokens to refresh metrics`, {
    count: allTokens.length,
  });
  const promises: Promise<Token | undefined>[] = [];
  for (const token of allTokens) {
    const awaitRes = _createToken(token);
    promises.push(awaitRes);
  }

  const results = await Promise.allSettled(promises);

  functions.logger.info("All tokens processed", {
    count: results.length,
  });

  const successes = results.filter(
    (result): result is PromiseFulfilledResult<Token> =>
      result.status === "fulfilled" && result.value !== undefined,
  );

  functions.logger.info("Successfully created tokens", {
    count: successes.length,
  });

  const enqueues: Promise<void>[] = [];
  for (const token of successes) {
    const payload: RefreshMetricsData = {
      mintAddress: token.value.mintAddress,
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

const _createToken = async (token: PumpFunCoin): Promise<Token | undefined> => {
  const existing = await getToken(token.mint);
  if (existing) {
    functions.logger.info(`Token already exists, skipping`, {
      mintAddress: token.mint,
    });
    return undefined;
  }
  const createdToken = await createToken({
    name: token.name,
    symbol: token.symbol,
    mintAddress: token.mint,
  });
  return createdToken;
};
