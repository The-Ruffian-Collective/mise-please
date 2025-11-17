# Quick Start Guide

## For Local Development (Without Database)

If you want to test the app locally without setting up a database, you can:

1. **Skip the database for now** - The app will build and run, but API calls will fail. This is useful for testing the UI.

2. **Use Vercel's development environment**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel link` to link to your Vercel project
   - Run `vercel dev` instead of `npm run dev`
   - This will use your Vercel Postgres database locally

## For Production Deployment

### Step 1: Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project" and import your GitHub repository

4. Deploy (Vercel auto-detects Next.js settings)

### Step 2: Add Database

1. In your Vercel project dashboard, go to "Storage" tab

2. Click "Create Database" → Select "Postgres"

3. Choose a region close to your users

4. Click "Create"

5. Environment variables are automatically added to your project

### Step 3: Initialize Database

1. Go to your deployed URL: `https://your-app.vercel.app/api/init`

2. You should see: `{"success":true,"message":"Database initialized and seeded successfully"}`

3. Your app is now ready to use!

## Default Stations

The app comes pre-seeded with these stations:
- Larder
- Hot
- Pastry
- Grill
- Misc

## First Steps

1. Visit your app URL
2. Click "Add Task" to add your first prep task
3. Select a station, add a task title, and submit
4. Go to "Overview" to see all tasks
5. Click "Generate MEP" to see the print-ready list

## Troubleshooting

**Build fails**: Make sure you're using Node.js 18 or higher

**API errors**: Database not initialized - visit `/api/init`

**Can't connect to database**: Check environment variables in Vercel dashboard

**Tasks not showing**: Make sure you've initialized the database and added tasks for the correct date

## Support

For issues, check the README.md or open an issue on GitHub.
