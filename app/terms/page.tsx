import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BrickCheck Terms of Service - Read our terms and conditions for using the app.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <p className="text-muted-foreground mb-8">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using BrickCheck ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access or use the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Description of Service</h2>
            <p>
              BrickCheck is a mobile application that allows users to track their LEGO collection, monitor set prices, scan barcodes, and receive price alerts. The App provides pricing information from third-party sources and is intended for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must create an account to use certain features of the App.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the App for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the App or its systems</li>
              <li>Interfere with or disrupt the App or servers connected to the App</li>
              <li>Use automated systems (bots, scrapers) to access the App without permission</li>
              <li>Reproduce, duplicate, copy, or exploit any portion of the App without express written permission</li>
              <li>Transmit any viruses, malware, or other harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Pricing Information</h2>
            <p>
              The App provides pricing information from third-party sources including BrickLink, Brickset, and other LEGO marketplaces. This information is provided for informational purposes only and should not be considered as financial or investment advice.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Pricing data may not always be accurate or up-to-date</li>
              <li>Actual market prices may vary from displayed prices</li>
              <li>We do not guarantee the accuracy, completeness, or timeliness of pricing information</li>
              <li>You should verify pricing information before making any purchase or sale decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property</h2>
            <p>
              The App and its original content, features, and functionality are owned by BrickCheck and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mt-4">
              LEGO is a trademark of the LEGO Group, which does not sponsor, authorize, or endorse this app. All LEGO-related trademarks and images are the property of the LEGO Group.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
            <p>
              The App uses third-party services and APIs, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Supabase for authentication and data storage</li>
              <li>BrickLink API for pricing and set data</li>
              <li>Brickset API for catalog information</li>
              <li>Vercel for hosting and infrastructure</li>
            </ul>
            <p className="mt-4">
              Your use of these third-party services is subject to their respective terms of service and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="mt-4">
              We do not warrant that the App will be uninterrupted, secure, or error-free, or that defects will be corrected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRICKCHECK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE APP.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless BrickCheck and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your use of the App or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Termination</h2>
            <p>We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason, including if you breach these Terms.</p>
            <p className="mt-4">
              Upon termination, your right to use the App will cease immediately. You may delete your account at any time through the app settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="mt-4">
              Your continued use of the App after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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

