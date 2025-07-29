# Google OAuth Login Setup

This guide will help you set up Google OAuth login for your React application.

## Prerequisites

1. A Google Cloud Console account
2. Your backend server configured to handle Google OAuth

## Step 1: Set up Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your domain to the "Authorized JavaScript origins":
   - For development: `http://localhost:5173` (or your Vite dev server port)
   - For production: `https://yourdomain.com`
8. Add your redirect URIs if needed
9. Copy the generated Client ID

## Step 2: Configure Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_SERVER_URL=http://localhost:3000
```

Replace `your_google_client_id_here` with the Client ID you copied from Google Cloud Console.

## Step 3: Backend Configuration

Your backend needs to handle the Google OAuth flow. You'll need to create an endpoint at `/auth/google` that:

1. Receives the credential from the frontend
2. Verifies the token with Google
3. Creates or updates the user in your database
4. Sets up a session/cookie for the user
5. Returns user data

Example backend endpoint structure:

```javascript
POST /auth/google
{
  "credential": "google_jwt_token_here"
}
```

## Step 4: Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the "Continue with Google" button
4. Complete the Google OAuth flow
5. Verify you're redirected to the appropriate page based on your user role

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**: Make sure your Client ID is correct and the domain is authorized
2. **CORS errors**: Ensure your backend allows requests from your frontend domain
3. **"Credential not found"**: Check that your backend is properly receiving and processing the credential

### Debug Steps:

1. Check browser console for any JavaScript errors
2. Verify your environment variables are loaded correctly
3. Test the Google OAuth flow in an incognito window
4. Check your backend logs for any authentication errors

## Security Considerations

1. Always verify the Google token on your backend
2. Use HTTPS in production
3. Implement proper session management
4. Consider implementing CSRF protection
5. Validate user data before creating accounts

## Additional Features

You can customize the Google login button by modifying the `GoogleLoginButton` component:

- Change the button theme: `theme="filled_black"` or `theme="outline"`
- Adjust the button size: `size="large"` or `size="medium"`
- Modify the button text: `text="continue_with"` or `text="signin_with"`
- Change the button shape: `shape="rectangular"` or `shape="pill"`

## Backend Integration Example

Here's a basic example of what your backend `/auth/google` endpoint might look like:

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user in your database
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        // Add other required fields
      });
    }

    // Set up session/cookie
    req.session.userId = user.id;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        admin: user.admin || false,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});
```
