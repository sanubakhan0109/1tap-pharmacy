import React from 'react';
import LegalPage from '../components/LegalPage';
import { usePageMeta } from '../utils/seo';

export default function Privacy() {
  usePageMeta({
    title: 'Privacy Policy',
    description: 'How 1TAP Pharmacy handles your account, inquiry, order and delivery information.',
    path: '/privacy',
  });

  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what information 1TAP Pharmacy collects when you use our website, and how we use it. We only collect what is needed to run the store."
    >
      <section>
        <h2>1. Information we collect</h2>
        <ul>
          <li><strong>Account information:</strong> when you register or sign in (including Google sign-in), we receive your name, email address and any profile details you provide, such as phone number and delivery address.</li>
          <li><strong>Order information:</strong> when you place an order, we collect your name, phone number, delivery address with pincode, ordered items and order totals so we can fulfil and deliver it.</li>
          <li><strong>Inquiries:</strong> when you contact us through the inquiry form, we collect your name, email address, phone number (if provided) and message.</li>
          <li><strong>Technical information:</strong> our servers process standard request data (such as IP address) to operate the chatbot and protect against abuse.</li>
        </ul>
      </section>
      <section>
        <h2>2. How we use your information</h2>
        <ul>
          <li>To create and manage your account and keep you signed in on your device.</li>
          <li>To process, deliver and provide status updates for your Cash on Delivery orders.</li>
          <li>To respond to your inquiries and support requests.</li>
          <li>To operate the on-site shopping assistant and improve our catalogue.</li>
        </ul>
      </section>
      <section>
        <h2>3. Third-party services</h2>
        <p>
          Our website runs on infrastructure provided by Supabase (database and authentication), which stores
          account, order and inquiry data on our behalf, and Google sign-in when you choose it. Product
          recommendations in the shopping assistant may be generated with Google&apos;s Gemini AI service using
          only the message you send and our product catalogue. We do not sell your personal information.
        </p>
      </section>
      <section>
        <h2>4. Cookies and tracking</h2>
        <p>
          We do not use advertising trackers or analytics cookies. Your sign-in session is kept in your
          browser&apos;s local storage so you stay logged in on your device. Because no optional tracking
          technologies are used, no cookie-consent banner is shown.
        </p>
      </section>
      <section>
        <h2>5. Data access and retention</h2>
        <p>
          You can view and update your profile and delivery details from the My Profile page, and view your
          order history from the My Orders page. Customers can only ever access their own data. If you want
          your account or personal data removed, contact support and we will process an authorised deletion
          request. Order records needed for delivery and support are kept only as long as necessary.
        </p>
      </section>
      <section>
        <h2>6. Security</h2>
        <p>
          Access to customer data is enforced with database-level permissions: administrative operations
          require an explicitly authorised administrator account, and frontend pages alone never grant access
          to another customer&apos;s information. No system is perfectly secure, so please keep your password
          private and tell us immediately if you suspect misuse of your account.
        </p>
      </section>
      <section>
        <h2>7. Changes to this policy</h2>
        <p>
          If this policy changes, the updated version will be published on this page. Continued use of the
          website after changes means you accept the updated policy.
        </p>
      </section>
    </LegalPage>
  );
}
