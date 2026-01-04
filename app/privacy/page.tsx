import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BrickCheck Privacy Policy - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <p className="text-muted-foreground mb-8">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
            <p>
              BrickCheck ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your email address and password (stored securely and encrypted).</li>
              <li><strong>Collection Data:</strong> Information about your LEGO collection, including sets you own, acquisition costs, dates, and notes.</li>
              <li><strong>Alert Preferences:</strong> Your price alert settings and notification preferences.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> How you interact with the app (features used, pages viewed).</li>
              <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers (for push notifications).</li>
              <li><strong>Camera Access:</strong> Used solely for scanning barcodes on LEGO sets. Images are processed locally and not stored or transmitted.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Third-Party Services</h3>
            <p>We use the following third-party services that may collect information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> For authentication and data storage. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Privacy Policy</a>.</li>
              <li><strong>Vercel:</strong> For hosting and API services. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel Privacy Policy</a>.</li>
              <li><strong>BrickLink API:</strong> For LEGO set and pricing data. See <a href="https://www.bricklink.com/v3/api.page" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BrickLink Terms</a>.</li>
              <li><strong>Brickset API:</strong> For LEGO set catalog data. See <a href="https://brickset.com/article/52664/api-version-3-documentation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Brickset Terms</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Authenticate your account</li>
              <li>Store and manage your LEGO collection data</li>
              <li>Send price alerts and notifications (with your consent)</li>
              <li>Improve our app and user experience</li>
              <li>Analyze usage patterns</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your data is stored securely using Supabase (hosted on secure cloud infrastructure).</li>
              <li>We use industry-standard encryption for data in transit and at rest.</li>
              <li>Passwords are hashed and never stored in plain text.</li>
              <li>We implement appropriate technical and organizational measures to protect your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party service providers who assist in operating our app (Supabase, Vercel) under strict confidentiality agreements.</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights and safety.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information through the app settings</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data</li>
              <li><strong>Data Portability:</strong> Export your collection data</li>
              <li><strong>Opt-Out:</strong> Disable push notifications in device settings</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:support@brickcheck.app" className="text-primary hover:underline">support@brickcheck.app</a> or use the in-app settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Camera and Photo Permissions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Camera:</strong> Required for barcode scanning. Images are processed locally on your device and not stored or uploaded.</li>
              <li><strong>Photos:</strong> Optional, for saving scanned images. Only used if you explicitly choose to save images.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Push Notifications</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We send push notifications for price alerts (if enabled).</li>
              <li>You can disable push notifications at any time in device settings.</li>
              <li>Device tokens are stored securely and used solely for sending notifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at <a href="mailto:support@brickcheck.app" className="text-primary hover:underline">support@brickcheck.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">International Users</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. By using our app, you consent to the transfer of your information to the United States and other countries where our service providers operate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posting the new Privacy Policy in the app</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:support@brickcheck.app" className="text-primary hover:underline">support@brickcheck.app</a></li>
              <li><strong>Website:</strong> <a href="https://www.brickcheck.app" className="text-primary hover:underline">https://www.brickcheck.app</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

