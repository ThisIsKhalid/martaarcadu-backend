import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  frontend_url: process.env.FRONTEND_URL,
  backend_image_url: process.env.BACKEND_IMAGE_URL,
  port: process.env.PORT || 8000,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    stripe_public_key: process.env.STRIPE_PUBLIC_KEY,
  },
  paypal: {
    client_id: process.env.PAYPEL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE,
  },
  sendGrid: {
    api_key: process.env.SENDGRID_API_KEY,
    email_from: process.env.SENDGRID_EMAIL,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  password: {
    password_salt: process.env.PASSWORD_SALT,
  },
  brevo: {
    email: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_PASSWORD,
    api_key: process.env.BREVO_API_KEY,
  },
};
