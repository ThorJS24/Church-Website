import { NextRequest, NextResponse } from 'next/server';

const API_DOCS = {
  title: 'Salem Primitive Baptist Church API',
  version: '1.0.0',
  description: 'Comprehensive API documentation for the church website',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  endpoints: {
    authentication: {
      '/api/auth/login': {
        method: 'POST',
        description: 'User login',
        parameters: {
          email: 'string (required)',
          password: 'string (required)'
        },
        response: {
          success: 'boolean',
          token: 'string',
          user: 'object'
        }
      },
      '/api/auth/register': {
        method: 'POST',
        description: 'User registration',
        parameters: {
          firstName: 'string (required)',
          lastName: 'string (required)',
          email: 'string (required)',
          password: 'string (required)',
          phone: 'string (optional)'
        }
      }
    },
    services: {
      '/api/services/request': {
        method: 'POST',
        description: 'Submit wedding or baptism service request',
        parameters: {
          serviceType: 'string (wedding|baptism)',
          firstName: 'string (required)',
          lastName: 'string (required)',
          email: 'string (required)',
          phone: 'string (required)',
          preferredDate: 'string (required)',
          alternateDate: 'string (optional)',
          partnerName: 'string (required for wedding)',
          message: 'string (optional)'
        }
      }
    },
    donations: {
      '/api/donations/history': {
        method: 'GET',
        description: 'Get user donation history',
        headers: {
          Authorization: 'Bearer <token> (required)'
        },
        response: {
          donations: 'array of donation objects'
        }
      }
    },
    notifications: {
      '/api/notifications/email': {
        method: 'POST',
        description: 'Send email notification',
        parameters: {
          to: 'string (required)',
          subject: 'string (required)',
          html: 'string (required)',
          type: 'string (optional)',
          userId: 'string (optional)'
        }
      },
      '/api/notifications/sms': {
        method: 'POST',
        description: 'Send SMS notification',
        parameters: {
          to: 'string (required)',
          message: 'string (required)',
          type: 'string (optional)',
          userId: 'string (optional)'
        }
      }
    },
    search: {
      '/api/search': {
        method: 'GET',
        description: 'Full-text search across all content',
        parameters: {
          q: 'string (search query, required)',
          type: 'string (all|sermons|events|announcements|prayers|gallery|ministries)',
          limit: 'number (default: 20)'
        },
        response: {
          query: 'string',
          totalResults: 'number',
          results: 'object with categorized results'
        }
      }
    },
    webhooks: {
      '/api/webhooks': {
        method: 'POST',
        description: 'Webhook endpoint for third-party integrations',
        headers: {
          'x-webhook-signature': 'string (required)',
          'x-webhook-timestamp': 'string (required)',
          'x-webhook-event': 'string (required)'
        },
        events: [
          'donation.completed',
          'user.registered',
          'event.registered',
          'prayer.submitted',
          'service.requested'
        ]
      }
    }
  },
  errorCodes: {
    400: 'Bad Request - Invalid parameters',
    401: 'Unauthorized - Invalid or missing authentication',
    403: 'Forbidden - Insufficient permissions',
    404: 'Not Found - Resource not found',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error - Server error'
  },
  authentication: {
    type: 'Bearer Token',
    description: 'Include JWT token in Authorization header: Bearer <token>',
    tokenExpiry: '24 hours'
  },
  rateLimit: {
    general: '100 requests per minute',
    authentication: '5 requests per minute',
    webhooks: '1000 requests per minute'
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  if (format === 'html') {
    const html = generateHTMLDocs(API_DOCS);
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  return NextResponse.json(API_DOCS);
}

function generateHTMLDocs(docs: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${docs.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        h3 { color: #1d4ed8; }
        .endpoint { background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: white; margin-right: 10px; }
        .post { background: #10b981; }
        .get { background: #3b82f6; }
        code { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-family: 'Monaco', 'Consolas', monospace; }
        pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .parameter { margin: 5px 0; }
        .required { color: #dc2626; font-weight: bold; }
        .optional { color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${docs.title}</h1>
        <p><strong>Version:</strong> ${docs.version}</p>
        <p><strong>Base URL:</strong> <code>${docs.baseUrl}</code></p>
        <p>${docs.description}</p>

        <h2>Authentication</h2>
        <p><strong>Type:</strong> ${docs.authentication.type}</p>
        <p><strong>Description:</strong> ${docs.authentication.description}</p>
        <p><strong>Token Expiry:</strong> ${docs.authentication.tokenExpiry}</p>

        <h2>Rate Limits</h2>
        <ul>
          <li><strong>General:</strong> ${docs.rateLimit.general}</li>
          <li><strong>Authentication:</strong> ${docs.rateLimit.authentication}</li>
          <li><strong>Webhooks:</strong> ${docs.rateLimit.webhooks}</li>
        </ul>

        <h2>Endpoints</h2>
        ${Object.entries(docs.endpoints).map(([category, endpoints]: [string, any]) => `
          <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          ${Object.entries(endpoints).map(([path, endpoint]: [string, any]) => `
            <div class="endpoint">
              <h4>
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <code>${path}</code>
              </h4>
              <p>${endpoint.description}</p>
              ${endpoint.parameters ? `
                <h5>Parameters:</h5>
                ${Object.entries(endpoint.parameters).map(([param, type]: [string, any]) => `
                  <div class="parameter">
                    <code>${param}</code>: ${type.includes('required') ? '<span class="required">' + type + '</span>' : '<span class="optional">' + type + '</span>'}
                  </div>
                `).join('')}
              ` : ''}
              ${endpoint.headers ? `
                <h5>Headers:</h5>
                ${Object.entries(endpoint.headers).map(([header, desc]: [string, any]) => `
                  <div class="parameter">
                    <code>${header}</code>: ${desc}
                  </div>
                `).join('')}
              ` : ''}
              ${endpoint.response ? `
                <h5>Response:</h5>
                <pre>${JSON.stringify(endpoint.response, null, 2)}</pre>
              ` : ''}
              ${endpoint.events ? `
                <h5>Supported Events:</h5>
                <ul>
                  ${endpoint.events.map((event: string) => `<li><code>${event}</code></li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        `).join('')}

        <h2>Error Codes</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(docs.errorCodes).map(([code, desc]: [string, any]) => `
              <tr>
                <td><code>${code}</code></td>
                <td>${desc}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}