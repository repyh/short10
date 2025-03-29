# Short10 - URL Shortener 🔗

A modern, responsive URL shortener built with Next.js, TypeScript, and MongoDB. Short10 provides a clean and intuitive interface to create, track, and manage shortened URLs.

## Features

- Shorten URLs with optional custom paths
- Track click counts for each shortened URL
- Search and filter through shortened URLs
- Light and dark mode support
- Fully responsive design

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Packages**:
  - `nanoid` for generating unique IDs
  - `mongoose` for MongoDB interaction

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shortener.git
   cd shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   DB_USERNAME=db_access_username
   DB_PASSWORD=db_access_password
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
shortener/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── [shortId]/   # Dynamic route for URL redirection
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   ├── sections/    # Larger page sections
│   ├── database/        # MongoDB connection and models
│   └── ...
├── tailwind.config.js   # Tailwind CSS configuration
└── ...
```

## API Endpoints

- `POST /api/short` - Create a new short URL
- `GET /api/short` - Retrieve all short URLs
- `GET /api/short/[id]` - Retrieve a specific short URL
- `DELETE /api/short/[id]` - Delete a short URL
- `GET /[shortId]` - Redirect to the target URL

## Development Notes

- This project uses Tailwind CSS for styling.
- The database schema is defined using Mongoose.
- The application is designed to be extended and customized by developers.

## Contributing

Contributions are welcome. Please fork the repository, create a feature branch, and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.