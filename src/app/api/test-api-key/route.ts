import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT FOUND',
    envVarName: 'FOOTBALL_DATA_API_KEY',
    nodeEnv: process.env.NODE_ENV,
  });
}
