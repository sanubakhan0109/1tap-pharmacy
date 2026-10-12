import React from 'react';
import LegalPage from '../components/LegalPage';
import { usePageMeta } from '../utils/seo';

export default function Terms() {
  usePageMeta({
    title: 'Terms and Conditions',
    description: 'Terms for shopping, accounts and Cash on Delivery orders at 1TAP Pharmacy.',
    path: '/terms',
  });

  return (
    <LegalPage
      title="Terms and Conditions"
      intro="By using the 1TAP Pharmacy website and placing orders, you agree to the terms below."
    >
      <section>
        <h2>1. About our store</h2>
        <p>
          1TAP Pharmacy is an online store for healthcare, skincare, beauty and personal-care products from
          multiple trusted brands. Product images, descriptions and prices are shown in good faith; if a
          product becomes unavailable after you order, we will inform you and cancel or adjust the affected
          items.
        </p>
      </section>
      <section>
        <h2>2. Accounts</h2>
        <ul>
          <li>You may browse products without an account, but checkout requires signing in.</li>
          <li>You can register with an email address and password, or sign in with Google.</li>
          <li>You are responsible for keeping your login credentials confidential and for activity under your account.</li>
          <li>Please provide accurate contact and delivery details so your parcel reaches you.</li>
        </ul>
      </section>
      <section>
        <h2>3. Orders and payment</h2>
        <ul>
          <li>We currently accept <strong>Cash on Delivery (COD) only</strong>: you pay in cash when your parcel arrives.</li>
          <li>Delivery is free — a ₹0 delivery charge is shown at checkout.</li>
          <li>Placing an order is an offer to buy; the order is confirmed once we accept and process it. You can track its status from the My Orders page.</li>
          <li>Prices are shown in Indian Rupees (₹) and are inclusive of applicable taxes where stated at checkout.</li>
        </ul>
      </section>
      <section>
        <h2>4. Acceptable use</h2>
        <ul>
          <li>Do not misuse the website, attempt to access other customers&apos; accounts or orders, or interfere with the service.</li>
          <li>Do not submit false order information or abusive inquiry messages.</li>
          <li>We may refuse or cancel orders that appear fraudulent or undeliverable, and may suspend accounts that violate these terms.</li>
        </ul>
      </section>
      <section>
        <h2>5. Product information</h2>
        <p>
          Product information on this website is for shopping purposes and is not medical advice. If you have
          a health condition or question about a product&apos;s suitability, please consult a qualified doctor
          or pharmacist before use.
        </p>
      </section>
      <section>
        <h2>6. Liability</h2>
        <p>
          To the extent permitted by law, 1TAP Pharmacy is not liable for indirect losses arising from use of
          the website. Nothing in these terms limits rights you have under applicable consumer-protection law.
        </p>
      </section>
    </LegalPage>
  );
}
