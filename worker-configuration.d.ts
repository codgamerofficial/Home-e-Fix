declare global {
	interface Fetcher {
		fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	}
}

interface Fetcher {
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

interface __BaseEnv_Env {
	ASSETS: Fetcher;
	ENVIRONMENT: "preview" | "production";
	OTP_PROVIDER_MODE: "development" | "production";
	VITE_SUPABASE_URL: string;
	VITE_SUPABASE_ANON_KEY: string;
	SUPABASE_AUTH_CALLBACK_URL: string;
	VITE_SUPABASE_AUTH_CALLBACK_URL: string;
	VITE_API_BASE_URL: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	VITE_GOOGLE_CLIENT_ID: string;
	NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
	RAZORPAY_KEY_ID: string;
	VITE_RAZORPAY_KEY_ID: string;
	RAZORPAY_KEY_SECRET: string;
	RESEND_API_KEY: string;
	RESEND_FROM_EMAIL: string;
	MAPMYINDIA_MAP_API_KEY: string;
	MAPMYINDIA_CLIENT_ID: string;
	MAPMYINDIA_CLIENT_SECRET: string;
	VITE_MAP_API_KEY: string;
	VITE_MAPMYINDIA_MAP_API_KEY: string;
	VITE_MAPMYINDIA_CLIENT_ID: string;
	SUPABASE_URL: string;
	RAZORPAY_WEBHOOK_SECRET: string;
	VITE_TURNSTILE_SITE_KEY: string;
	TURNSTILE_SECRET: string;
	TURNSTILE_SECRET_KEY: string;
	TURNSTILE_HOSTNAMES?: string;
	NODE_ENV: string;
	BUSINESS_TIMEZONE: string;
	DEFAULT_COUNTRY: string;
	DEFAULT_CURRENCY: string;
}
declare namespace Cloudflare {
	interface Fetcher {
		fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	}
	interface GlobalProps {
		mainModule: typeof import("./worker/index");
	}
	interface PreviewEnv {
		ASSETS: Fetcher;
		ENVIRONMENT: "preview";
		OTP_PROVIDER_MODE: "development";
		VITE_SUPABASE_URL: string;
		VITE_SUPABASE_ANON_KEY: string;
		SUPABASE_AUTH_CALLBACK_URL: string;
		VITE_SUPABASE_AUTH_CALLBACK_URL: string;
		VITE_API_BASE_URL: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		VITE_GOOGLE_CLIENT_ID: string;
		NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
		RAZORPAY_KEY_ID: string;
		VITE_RAZORPAY_KEY_ID: string;
		RAZORPAY_KEY_SECRET: string;
		RESEND_API_KEY: string;
		RESEND_FROM_EMAIL: string;
		MAPMYINDIA_MAP_API_KEY: string;
		MAPMYINDIA_CLIENT_ID: string;
		MAPMYINDIA_CLIENT_SECRET: string;
		VITE_MAP_API_KEY: string;
		VITE_MAPMYINDIA_MAP_API_KEY: string;
		VITE_MAPMYINDIA_CLIENT_ID: string;
		SUPABASE_URL: string;
		RAZORPAY_WEBHOOK_SECRET: string;
		VITE_TURNSTILE_SITE_KEY: string;
		TURNSTILE_SECRET: string;
		TURNSTILE_SECRET_KEY: string;
		NODE_ENV: string;
		BUSINESS_TIMEZONE: string;
		DEFAULT_COUNTRY: string;
		DEFAULT_CURRENCY: string;
	}
	interface ProductionEnv {
		ASSETS: Fetcher;
		ENVIRONMENT: "production";
		OTP_PROVIDER_MODE: "production";
		VITE_SUPABASE_URL: string;
		VITE_SUPABASE_ANON_KEY: string;
		SUPABASE_AUTH_CALLBACK_URL: string;
		VITE_SUPABASE_AUTH_CALLBACK_URL: string;
		VITE_API_BASE_URL: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		VITE_GOOGLE_CLIENT_ID: string;
		NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
		RAZORPAY_KEY_ID: string;
		VITE_RAZORPAY_KEY_ID: string;
		RAZORPAY_KEY_SECRET: string;
		RESEND_API_KEY: string;
		RESEND_FROM_EMAIL: string;
		MAPMYINDIA_MAP_API_KEY: string;
		MAPMYINDIA_CLIENT_ID: string;
		MAPMYINDIA_CLIENT_SECRET: string;
		VITE_MAP_API_KEY: string;
		VITE_MAPMYINDIA_MAP_API_KEY: string;
		VITE_MAPMYINDIA_CLIENT_ID: string;
		SUPABASE_URL: string;
		RAZORPAY_WEBHOOK_SECRET: string;
		VITE_TURNSTILE_SITE_KEY: string;
		TURNSTILE_SECRET: string;
		TURNSTILE_SECRET_KEY: string;
		NODE_ENV: string;
		BUSINESS_TIMEZONE: string;
		DEFAULT_COUNTRY: string;
		DEFAULT_CURRENCY: string;
	}
	interface Env extends __BaseEnv_Env {}
}
interface Env extends __BaseEnv_Env {}
type StringifyValues<EnvType extends Record<string, unknown>> = {
	[Binding in keyof EnvType]: EnvType[Binding] extends string ? EnvType[Binding] : string;
};
declare namespace NodeJS {
	interface ProcessEnv extends StringifyValues<Pick<Cloudflare.Env, "ENVIRONMENT" | "OTP_PROVIDER_MODE" | "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY" | "SUPABASE_AUTH_CALLBACK_URL" | "VITE_SUPABASE_AUTH_CALLBACK_URL" | "VITE_API_BASE_URL" | "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "VITE_GOOGLE_CLIENT_ID" | "NEXT_PUBLIC_RAZORPAY_KEY_ID" | "RAZORPAY_KEY_ID" | "VITE_RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET" | "RESEND_API_KEY" | "RESEND_FROM_EMAIL" | "MAPMYINDIA_MAP_API_KEY" | "MAPMYINDIA_CLIENT_ID" | "MAPMYINDIA_CLIENT_SECRET" | "VITE_MAP_API_KEY" | "VITE_MAPMYINDIA_MAP_API_KEY" | "VITE_MAPMYINDIA_CLIENT_ID" | "SUPABASE_URL" | "RAZORPAY_WEBHOOK_SECRET" | "VITE_TURNSTILE_SITE_KEY" | "TURNSTILE_SECRET" | "TURNSTILE_SECRET_KEY" | "NODE_ENV" | "BUSINESS_TIMEZONE" | "DEFAULT_COUNTRY" | "DEFAULT_CURRENCY">> {}
}
