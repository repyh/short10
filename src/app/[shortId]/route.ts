import { NextRequest, NextResponse } from "next/server";
import Short from "@/database/Short";
import connectDB from "@/database/connect";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shortId: string }> }
) {
  try {
    await connectDB();

    const { shortId } = await context.params;

    const shortUrl = await Short.findOne({ id: shortId });

    if (!shortUrl) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: 'Inter', sans-serif; 
                background: black; 
                color: white; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0; 
                padding: 20px;
                text-align: center;
              }
              h1 { 
                font-family: 'Nunito', sans-serif; 
                font-size: clamp(1.5rem, 5vw, 2rem);
                margin-bottom: 1rem; 
                background: linear-gradient(to right, #60a5fa, #a78bfa); 
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              p { 
                margin-bottom: 1.5rem; 
                font-size: clamp(0.875rem, 3vw, 1rem);
              }
              a { 
                color: #60a5fa; 
                text-decoration: none; 
                transition: color 0.2s;
                padding: 0.5rem 1rem;
                border: 1px solid #60a5fa;
                border-radius: 0.5rem;
              }
              a:hover { 
                color: #a78bfa; 
                border-color: #a78bfa;
              }
              .card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: clamp(1.5rem, 5vw, 2rem);
                width: 90%;
                max-width: 500px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found</h1>
              <p>Sorry, the short URL you visited does not exist or has been removed.</p>
              <a href="/">Go to Homepage</a>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Increment click count
    shortUrl.clicks += 1;
    await shortUrl.save();

    // Redirect to the original URL
    return NextResponse.redirect(shortUrl.targetURL);

  } catch (error) {
    console.error("Error processing redirect:", error);

    // Return a server error page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Server Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: black; 
              color: white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              padding: 20px;
              text-align: center;
            }
            h1 { 
              font-family: 'Nunito', sans-serif; 
              font-size: clamp(1.5rem, 5vw, 2rem);
              margin-bottom: 1rem; 
              background: linear-gradient(to right, #ef4444, #f97316); 
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p { 
              margin-bottom: 1.5rem; 
              font-size: clamp(0.875rem, 3vw, 1rem);
            }
            a { 
              color: #60a5fa; 
              text-decoration: none; 
              transition: color 0.2s;
              padding: 0.5rem 1rem;
              border: 1px solid #60a5fa;
              border-radius: 0.5rem;
            }
            a:hover { 
              color: #a78bfa; 
              border-color: #a78bfa;
            }
            .card {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: clamp(1.5rem, 5vw, 2rem);
              width: 90%;
              max-width: 500px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Server Error</h1>
            <p>Sorry, something went wrong while processing your request. Please try again later.</p>
            <a href="/">Go to Homepage</a>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}
