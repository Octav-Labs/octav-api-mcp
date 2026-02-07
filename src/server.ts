import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OctavAPIClient } from './api/client.js';
import { toolRegistry } from './tools/index.js';
import { OctavAPIError, ValidationError } from './api/errors.js';

export class OctavMCPServer {
  private server: Server;
  private apiClient: OctavAPIClient;

  constructor(apiKey: string) {
    this.apiClient = new OctavAPIClient(apiKey);

    this.server = new Server(
      {
        name: 'octav-api-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = toolRegistry.getAllToolDefinitions();
      return { tools };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!toolRegistry.hasTool(name)) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Unknown tool '${name}'`,
              },
            ],
            isError: true,
          };
        }

        const result = await toolRegistry.executeTool(name, args || {}, this.apiClient);
        return result;
      } catch (error) {
        // Format error messages
        let errorMessage = 'An unknown error occurred';

        if (error instanceof ValidationError) {
          errorMessage = `Validation Error: ${error.message}`;
        } else if (error instanceof OctavAPIError) {
          errorMessage = `API Error: ${error.message}`;
          if (error.statusCode === 402) {
            errorMessage += '\n\nPurchase more credits at: https://octav.fi';
          }
        } else if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        }

        return {
          content: [
            {
              type: 'text',
              text: errorMessage,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Octav API MCP server running on stdio');
  }
}
