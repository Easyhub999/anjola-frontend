# Customer policies — private publication review

Prepared: 16 October 2026. This file is review material, outside `public/` and the production build. It is not a customer-facing page. Publication of the completed work was authorized by the project owner with “Push all”. This document records the wording and verification at release preparation; it does not assert that an external legal review has occurred.

## Implemented position

- `/shipping-policy` explains payment confirmation, preparation, available delivery options, separate park transport fares, estimates, gifting, address corrections, redelivery and delivery problems.
- `/returns-policy` explicitly declines voluntary change-of-mind returns, refunds and exchanges for correctly supplied, accurately described, non-defective goods. It separately preserves mandatory remedies and covers evidence, inspection, misuse, hygiene-sensitive products, personalisation, cancellations, refunds and return costs.
- Customer copy lives in `src/policies.json`. The React pages, initial HTML, product-page notice and checkout notice share this source. The full proposed wording is reproduced below for review.
- Policy links are available in the footer, checkout and product support. Checkout links open separately so the current form is preserved. Links do not constitute a recorded acknowledgement; no acceptance checkbox or consent database has been added.
- Policies remain readable if the catalogue is unavailable or JavaScript is disabled. Both routes have metadata, canonical URLs, Open Graph tags, sitemap entries and Vercel rewrites.
- Email templates remove unsupported dispatch/tracking and arrival guarantees. Customer-facing support addresses now match the established website address. Sender configuration is unchanged.

## Business follow-up

| Decision | Current draft treatment |
| --- | --- |
| Processing and delivery estimates | No invented SLA. Customers are asked to confirm timing for their order, particularly for an occasion. Confirm estimates by service/location and how staff communicate delays. |
| Park transport quotation | No online fare is charged. The customer is asked to confirm the separate fare and collection arrangements before ordering, then pay the driver. Confirm the business can provide or coordinate this quote; do not describe it as free shipping. |
| Refund timing and payment method | No fixed number of days or automatic refund promise. Confirm the approved method, internal processing target, provider timing and the staff member responsible before publishing a specific promise. |
| Return logistics | Support coordinates the return address, inspection and applicable transport costs. Confirm the actual collection/drop-off process and safe handling of hygiene-sensitive or damaged items. |
| Cancellations and redelivery | No invented percentage, fee or blanket forfeiture. Any proposed charge must be explained, reasonable and lawful. Confirm the operational calculation and escalation process. |
| Final legal wording | Nigerian legal review of the complete wording remains recommended, including cancellation rights and statutory remedies. The implementation does not claim legal certification or immunity from complaints or lawsuits. |

## Staff guidance for WhatsApp and direct orders

Share the policy links and key restrictions before payment, together with item/variant details, delivery arrangements and any customisation approval. Record the agreed details in the existing order notes where appropriate. Do not apply newly published restrictions retroactively to earlier orders.

Keep proportionate purchase, packing, dispatch and delivery records and relevant customer instructions. Record only information needed to handle the order or dispute, restrict access, and use the business's retention process. A new policy-version/acknowledgement recording system is not part of this change.

Inspect claims fairly. An order number is useful but not the only acceptable purchase evidence. Lack of an unboxing video or original packaging does not automatically defeat a valid claim. Do not assume misuse without considering the evidence. Do not promise that changing an order to cancelled automatically refunds a payment.

## SEO and release notes

Optional Google Merchant Listing warnings for `shippingDetails`, `hasMerchantReturnPolicy` and global identifiers remain unresolved intentionally. This change does not invent shipping rates, return windows or GTINs, or encode a general change-of-mind restriction as an unconditional refusal of all returns.

Metadata: `src/branding.json`. Hosting rewrites: `vercel.json`. Initial body generation: `scripts/build-seo.cjs` and `lib/policySeo.js`. The existing sitemap consumes public pages from branding configuration.

Production deployment must include both the frontend policy implementation and the backend email copy changes. No payment, inventory, refund engine, shipping prices or authentication changes are included.

## Verification

- Frontend production build passes.
- SEO tests: 17 pass, including complete initial policy content, escaping, canonicals, hosting rewrites and sitemap entries.
- Full frontend run: 148 tests pass across 16 suites. The existing `src/App.test.js` fails before running because the current Jest setup cannot resolve `react-router-dom`; it also contains the original starter-app expectation. This baseline failure remains visible rather than being excluded from the full run.
- Targeted checkout, product-detail and footer suites: 32 tests pass, including policy links preserving form details, delivery choice, gifting and the payment amount.
- Backend suite: 107 tests pass after delivery-copy edits. The subsequent support-address-only edit passes 18 relevant email/notification tests.
- Browser validation uses an isolated local production build and fixture API responses; no live orders or payments are created. Production hosting and Google indexing have not been verified by this local work.
- Desktop (1440px) and mobile (390px and 320px) browser checks pass for both policies: direct visits, reloads, readable initial HTML, catalogue outage handling, section-link focus, policy-to-policy navigation, canonical URLs and no horizontal overflow. Checkout disclosure/link checks and sitemap checks pass. No runtime exceptions were reported. A JavaScript-disabled preview was also inspected.

## Changed files

- `src/policies.json`, `src/pages/PolicyPage.js`, `src/pages/PolicyPage.css`: shared copy and responsive page presentation.
- `src/App.js`, `src/components/Footer.js`: routes, catalogue-outage handling and footer navigation.
- `src/pages/CheckoutPage.js`, `src/pages/CheckoutPage.css`, `src/pages/ProductDetailPage.js`, `src/pages/ProductDetailPage.css`: pre-purchase disclosures and policy links.
- `src/branding.json`, `vercel.json`, `scripts/build-seo.cjs`, `lib/policySeo.js`: page metadata, hosting and initial HTML.
- `src/pages/CheckoutPage.test.js`, `src/components/SiteChrome.test.js`, `tests/policySeo.test.cjs`: relevant regression coverage.
- `docs/customer-policies-review.md`: this private review and copy snapshot.
- Backend `services/emailService.js`: delivery wording and customer-facing support address.

## References for review

- [Federal Competition and Consumer Protection Act](https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf): sections 120, 122, 128, 129, 131 and 132 are relevant to cancellations, disclosure and non-excludable remedies.
- [FCCPC consumer rights and responsibilities](https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/).
- [Google Search Central return policy documentation](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

## Proposed customer-facing wording

The text below is a review snapshot of `src/policies.json`, not a second content source. Update the JSON for implementation changes.



### Shipping & Delivery

From choosing your delivery option to receiving your parcel, here is what to expect when you order from Anjola Aesthetics NG.

**Before you place your order**

Choose a delivery option that covers your location and review the charges before paying. Park delivery has a separate transport fare payable to the driver; it is not free shipping. If your order is for a particular date, contact us to confirm the arrangements before ordering.

#### Preparing your order

Order processing begins after payment has been confirmed. Keep your order number or payment reference so we can help with any questions.

Preparation time depends on the items and any agreed gift or personalisation requirements. Payment confirmation is not a dispatch notice. We will share a shipment update when your order is dispatched, with tracking details where available.

#### Delivery options & charges

Available delivery options and the locations they cover are listed at checkout. Select the option for your actual destination. If your location is not listed, contact us before paying so availability and cost can be confirmed.

For local and doorstep delivery, review the delivery charge shown for your selected option before payment. For an order arranged through WhatsApp, confirm the delivery method, destination and charges with us before paying.

- Park delivery: no transport fare is collected at checkout. You pay that fare separately to the driver. Confirm the fare and collection arrangements with us before ordering so you understand the total cost.
- Doorstep delivery: select the zone that lists your city and check that the address and contact number are complete.
- An amount of ₦0 collected online for park transport does not mean the transport is free.

#### Delivery timing & delays

Delivery estimates depend on the destination, selected service and order preparation. Contact us for an estimate before ordering if timing is important. An estimate is not a guaranteed arrival date unless we expressly agree otherwise.

Traffic, weather, public holidays and transport disruptions can affect delivery. We will communicate known delays affecting your order and help you follow up. If your parcel has not arrived as expected, contact us with your order reference.

#### Gift packaging & special requests

Gift packaging is an optional charge shown at checkout before payment. You can add a gift message when selecting that option.

Please confirm any custom gift box, personalised wording, special packaging or occasion-specific delivery request with us before ordering. Review names, messages and agreed product selections carefully before confirming them.

#### Addresses & missed deliveries

Provide an accurate delivery address, city, state and reachable phone number. Contact us promptly if you notice an error. Changes after dispatch depend on what the delivery partner can arrange.

If delivery or collection is missed, contact us to arrange the next step. Reasonable additional transport costs caused by an incorrect address or a missed agreed delivery may be payable by you; any proposed charge will be explained before redelivery is arranged. This does not transfer responsibility for a mistake made by us to you.

#### Missing, damaged or incorrect deliveries

Please check your parcel when it arrives and contact us promptly if anything is missing, damaged or different from your order. Keep the packaging and take relevant photos if you can; we can still review your concern if a photo, original packaging or an unboxing video is unavailable.

If tracking says delivered but you have not received your parcel, let us know so we can investigate with the delivery partner. We will help resolve delivery problems; handing a parcel to a courier does not by itself end our responsibilities.

Our Returns, Refunds & Exchanges policy explains the next steps for product issues. Nothing in this delivery policy removes your applicable consumer rights.

[Read our Returns, Refunds & Exchanges policy](https://anjolaaestheticsng.com/returns-policy)


### Returns, Refunds & Exchanges

Please choose your items carefully. If something is wrong with your order, we are here to help you find the appropriate resolution.

**No voluntary change-of-mind returns**

We do not offer voluntary returns, refunds or exchanges for a change of mind when goods are correctly supplied, match their description and are free from defects. Your statutory consumer rights remain protected.

#### Changing your mind after delivery

Our change-of-mind restriction covers personal preferences after a correctly fulfilled purchase: no longer needing the item, finding it cheaper elsewhere, choosing a different colour after receiving the colour ordered, or a gift recipient changing their preference.

Please review the product description, dimensions and available options before ordering. Ask us if you need help deciding. A problem with the product or its description is assessed separately from a change of preference.

#### When something is wrong

Contact us about damaged, defective, unsafe, incorrect or missing items, goods that do not match their description, or goods unsuitable for a qualifying purpose you communicated to us. We will assess the circumstances and provide the remedy required by applicable law.

Please report a concern as soon as you reasonably can. A request to contact us promptly is not a 24-hour or 48-hour cutoff and does not remove rights relating to a fault discovered later. Stop using an item if you believe it may be unsafe.

#### How to request help

Contact us by email or WhatsApp using the details below. The same approach applies to purchases made on our website and orders arranged directly with us.

Please contact us before sending an item back so we can confirm the appropriate return address and arrangements. This helps coordinate the return and does not give us a right to refuse a valid statutory claim.

- Share your order number or reasonable proof of purchase, such as a receipt, payment reference or WhatsApp purchase record.
- Tell us which item is affected and describe the problem, including when you noticed it.
- Include relevant photos if available. An unboxing video or original packaging is not an absolute requirement for reviewing a genuine issue.
- Keep the item and relevant accessories available for reasonable inspection. Share only the information needed to identify the purchase; never send passwords, payment PINs or full card details.

#### Product condition & care

We may inspect the item and compare it with the order information to understand the issue. Please keep it safe and avoid further use that could worsen damage.

Damage caused by misuse, alteration or improper care after delivery is assessed separately from a defect present when supplied. We will consider the evidence before attributing damage to a customer; ordinary inspection or opening packaging to discover a fault does not automatically invalidate a claim.

#### Hygiene-sensitive & personalised items

Opened cosmetics, personal-care products, customised gift boxes and personalised items are not eligible for voluntary change-of-mind returns, refunds or exchanges. Check personalisation details carefully before confirming your order.

These restrictions do not remove applicable remedies for defective, unsafe, incorrect or misdescribed goods. Contact us if there is a problem with a hygiene-sensitive or personalised product.

#### Cancellation requests

Contact us as soon as possible if you need to cancel an order. Cancellation before delivery is considered separately from a change-of-mind return after delivery. If a parcel is already in transit, we will check what can be arranged and explain the next steps.

Any cancellation charge must be reasonable, explained and permitted by applicable law. We will not impose a charge where the law prohibits it. A cancellation confirmation and a payment refund are separate steps; we will explain any refund due.

#### Refunds, replacements & return costs

The appropriate resolution depends on the problem and your applicable rights. Where a remedy is due, this may involve a repair, replacement or refund. We will explain the proposed resolution and any return arrangements.

We will meet return-transport costs where the law requires us to do so. We will not impose a restocking penalty on a qualifying statutory return or require store credit instead of a monetary refund where a refund is legally due.

If a refund is due, we will confirm the amount, payment method and expected processing time with you. Bank or payment-provider processing may affect when the funds reach your account. We do not promise an instant refund.

#### Your consumer rights

This policy operates alongside applicable Nigerian consumer protection law, including the Federal Competition and Consumer Protection Act. It does not exclude or limit rights or remedies that cannot lawfully be excluded.

Our change-of-mind restriction does not override those rights. Contact us if you would like a decision explained or reviewed; you remain free to use any complaint or legal remedy available to you.

[Read our Shipping & Delivery policy](https://anjolaaestheticsng.com/shipping-policy)

Support: anjolaaestheticsng@gmail.com · +234 706 594 3625 · https://wa.me/2347065943625
