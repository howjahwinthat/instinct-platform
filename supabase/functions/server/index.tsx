import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9e5ace6f/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint - create new user account
app.post("/make-server-9e5ace6f/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    // Create Supabase admin client using service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Supabase user creation error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user progress data in KV store
    if (data.user) {
      await kv.set(`user:${data.user.id}:progress`, {
        userId: data.user.id,
        completedLessons: [],
        quizScores: {},
        createdAt: new Date().toISOString()
      });

      await kv.set(`user:${data.user.id}:profile`, {
        userId: data.user.id,
        email,
        name,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      message: "Account created successfully. Please sign in." 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: "Failed to create account. Please try again." }, 500);
  }
});

// Get user progress endpoint (requires authentication)
app.get("/make-server-9e5ace6f/user/progress", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const progress = await kv.get(`user:${user.id}:progress`);
    const profile = await kv.get(`user:${user.id}:profile`);

    return c.json({ 
      progress: progress || { completedLessons: [], quizScores: {} },
      profile: profile || {}
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    return c.json({ error: "Failed to fetch user progress" }, 500);
  }
});

// Update user progress endpoint (requires authentication)
app.post("/make-server-9e5ace6f/user/progress", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { completedLessons, quizScores } = await c.req.json();

    await kv.set(`user:${user.id}:progress`, {
      userId: user.id,
      completedLessons: completedLessons || [],
      quizScores: quizScores || {},
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });

  } catch (error) {
    console.error('Update user progress error:', error);
    return c.json({ error: "Failed to update user progress" }, 500);
  }
});

Deno.serve(app.fetch);