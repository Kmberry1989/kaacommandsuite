import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { NextApiRequest, NextApiResponse } from "next";

// You must set these environment variables in your .env.local file
// GA_SERVICE_ACCOUNT_KEY_PATH: path to your service account JSON file
// GA_PROPERTY_ID: your Google Analytics property ID

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GA_SERVICE_ACCOUNT_KEY_PATH,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "2024-07-01", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    });
    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
