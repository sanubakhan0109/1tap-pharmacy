import React from 'react';
import LegalPage from '../components/LegalPage';
import { usePageMeta } from '../utils/seo';

export default function Shipping() {
  usePageMeta({
    title: 'Delivery, Cancellation & Refunds',
    description: '1TAP Pharmacy delivery, order cancellation and refund policy: free doorstep delivery with Cash on Delivery across India.',
    path: '/shipping',
  });

  return (
    <LegalPage
      title="Delivery, Cancellation & Refunds"
      intro="Simple, confirmed rules for how your 1TAP Pharmacy order reaches you — and what happens if plans change."
    >
      <section>
        <h2>1. Delivery</h2>
        <ul>
          <li>We offer <strong>free doorstep home delivery across India</strong> — the delivery charge shown at checkout is ₹0.</li>
          <li>Please enter a complete address with a correct 6-digit delivery pincode at checkout so your parcel is not delayed.</li>
          <li>You can follow your parcel&apos;s progress from the My Orders page after signing in.</li>
          <li>If our courier cannot reach you, we will attempt redelivery or contact you on the phone number provided with the order.</li>
        </ul>
      </section>
      <section>
        <h2>2. Cash on Delivery</h2>
        <p>
          All orders are payable in <strong>cash when the parcel arrives</strong>. Please keep the order total
          ready. Our delivery partner will confirm your order details at the doorstep.
        </p>
      </section>
      <section>
        <h2>3. Cancellation</h2>
        <ul>
          <li>To request cancellation, contact support with your order ID as early as possible.</li>
          <li>Requests are honoured according to the order&apos;s status: orders that are already shipped or delivered cannot be cancelled.</li>
          <li>If only part of your order can be fulfilled, we will inform you and adjust or cancel the affected items.</li>
        </ul>
      </section>
      <section>
        <h2>4. Refunds</h2>
        <p>
          Because we currently accept <strong>Cash on Delivery only</strong>, no advance payment is collected
          and there is normally nothing to refund. If you received a damaged, incorrect or missing item,
          contact support with your order ID and, where possible, a photo of the issue, and we will arrange a
          replacement or appropriate resolution.
        </p>
      </section>
    </LegalPage>
  );
}
