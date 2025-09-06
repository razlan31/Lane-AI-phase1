import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorksheetEmailRequest {
  to: string;
  worksheetType: string;
  pdfBase64: string;
  filename: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, worksheetType, pdfBase64, filename }: WorksheetEmailRequest = await req.json();

    if (!to || !worksheetType || !pdfBase64 || !filename) {
      throw new Error('Missing required fields');
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    // Get worksheet title
    const worksheetTitles: Record<string, string> = {
      roi: 'ROI Calculator',
      cashflow: 'Cashflow Projection', 
      breakeven: 'Breakeven Analysis',
      unitEconomics: 'Unit Economics',
      personal: 'Personal Finance',
      loanPayment: 'Loan Payment Calculator',
      npv: 'Net Present Value'
    };

    const worksheetTitle = worksheetTitles[worksheetType] || 'Financial Worksheet';

    // Prepare email payload
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: `Your ${worksheetTitle} Report`
        }
      ],
      from: {
        email: "noreply@yourdomain.com",
        name: "Lane AI"
      },
      content: [
        {
          type: "text/html",
          value: `
            <h2>Your ${worksheetTitle} Report</h2>
            <p>Hi there!</p>
            <p>Please find your ${worksheetTitle.toLowerCase()} report attached as a PDF.</p>
            <p>This report was generated on ${new Date().toLocaleDateString()} and contains your latest calculations and inputs.</p>
            <p>Best regards,<br>Lane AI Team</p>
          `
        }
      ],
      attachments: [
        {
          content: pdfBase64,
          filename: filename,
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log('Email sent successfully to:', to);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Worksheet emailed successfully',
        recipient: to 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in send-worksheet-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);