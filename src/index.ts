#!/usr/bin/env node
import 'dotenv/config';
import { OctavMCPServer } from './server.js';

async function main() {
  const apiKey = process.env.OCTAV_API_KEY;

  if (!apiKey) {
    console.error('Error: OCTAV_API_KEY environment variable is required');
    console.error('Please set it in your .env file or environment');
    process.exit(1);
  }

  try {
    const server = new OctavMCPServer(apiKey);
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
