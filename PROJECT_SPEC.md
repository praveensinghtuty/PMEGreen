PME COMMERCE — MASTER CODEX PROJECT PROMPT

0. ROLE AND OPERATING MODE

You are the senior full-stack engineer and technical owner implementing
this project. Build a production-quality, mobile-first e-commerce
application for a small, single-seller home business in Tamil Nadu,
India, selling oils and other organic/traditional products.

Do not treat this as a tutorial, demo, throwaway prototype, Amazon
clone, marketplace, or enterprise microservices exercise. Build a
polished, maintainable modular monolith appropriate for a real small
business.

Work incrementally. Do not attempt the entire application in one
uncontrolled pass.

Before changing code: 1. Inspect the existing repository and understand
what already exists. 2. Read all project documentation, migrations,
environment examples, and relevant source files. 3. Reuse existing
components, utilities, schemas, and patterns where they are good. 4. Do
not duplicate functionality. 5. Do not replace working architecture
merely to match this document if the repository has already evolved to
an equivalent or better solution. 6. State material assumptions when a
requirement is genuinely ambiguous. 7. Prefer the simplest robust
solution that satisfies the current requirement. 8. Do not over-engineer
for hypothetical scale.

After each implementation phase: 1. Run formatting if configured. 2. Run
linting. 3. Run TypeScript type checking. 4. Run relevant tests. 5. Run
the production build when practical. 6. Fix failures caused by your
changes. 7. Review for security, accessibility, responsive behavior, and
obvious regressions. 8. Update relevant documentation. 9. Summarize what
changed, important decisions, migrations, environment changes, and
remaining manual setup. 10. Stop before beginning the next major phase
unless explicitly instructed to continue.

Never claim that a command, test, migration, deployment, OAuth provider,
SMS provider, payment, or external integration works unless it was
actually verified.

---

1. PROJECT SUMMARY

Working project name: PME Commerce.

The working name is a placeholder and must not be deeply hardcoded
throughout the application. The final business name, logo, product
photography, banners, contact details, and branding assets will be
supplied later.

Build a premium direct-to-consumer e-commerce website for a small
home-based business selling products such as: - Cold-pressed and
traditional oils - Hair oils - Health mixes and malts - Traditional
powders and podi - Laddus and snacks - Honey - Pickles - Grocery items -
Personal-care products - Soaps - Other organic/traditional products

The current product catalog is supplied separately as a CSV/Excel file
containing product names, sizes/weights/variants, and prices. Treat that
file as the source for initial catalog normalization and seed/import
data. Do not invent missing product facts, health claims,
certifications, ingredients, descriptions, stock quantities, or images.

Business characteristics: - Single seller only. - Home-based small
business. - Customers and delivery restricted to Tamil Nadu, India, for
v1. - No GST functionality in v1. - No warehouse management. - No
multi-seller marketplace. - Orders are packed by the owner and sent
using external courier services. - No courier API integration in v1. -
No external business notifications in v1: no order SMS, WhatsApp
automation, or transactional email workflow. - Payment methods in v1:
Cash on Delivery and manual UPI. - Most customers are expected to use
mobile phones. - The website must be mobile-first and also polished on
desktop. - The admin experience must also work well on mobile.

The product should feel like a premium, trustworthy
organic/traditional-products brand, not like Amazon and not like a
generic admin-template demo.

---

2. PRIMARY GOALS

1. Make browsing and buying products extremely easy on mobile.
1. Present products in a clean, trustworthy, premium way.
1. Support products with multiple size/weight/custom variants and
   different prices.
1. Provide a short, understandable checkout flow.
1. Allow the business owner to manage products, variants, images,
   categories, orders, customers, banners, and store settings without
   technical knowledge.
1. Import the current catalog from CSV/XLSX with validation and
   preview.
1. Keep architecture maintainable and reusable for another
   single-seller small business later.
1. Provide secure authentication, authorization, database access, and
   order creation.
1. Optimize public catalog pages for performance and SEO.
1. Keep v1 appropriately small and avoid unnecessary enterprise
   complexity.

---

3. EXPLICIT NON-GOALS FOR V1

Do not implement unless later requested: - Marketplace or multiple
sellers - Seller portal - Multiple warehouses - Warehouse transfers or
complex inventory ledgers - GST calculation or GST invoices - Complex
tax engine - Multiple currencies - Delivery fleet management - Courier
API integrations - Automated shipping-rate APIs - External order
notifications - WhatsApp automation - Transactional email workflow -
Business SMS notifications - Reviews and ratings - Fake reviews or
testimonials - Coupons and promotions engine - Loyalty points - Referral
system - Returns/refunds workflow - Full payment-gateway integration -
Razorpay/Stripe in v1 - Complex enterprise RBAC - Full audit-log
platform - Full media-library/DAM - Microservices - Event buses -
Kubernetes - Elasticsearch/Algolia/Meilisearch for the initial catalog -
A full drag-and-drop page builder - Native Android or iOS applications

Design clean extension points where reasonable, but do not build unused
systems.

---

4. TECH STACK

Use current stable, mutually compatible versions at project
initialization. Do not blindly use prerelease versions.

Core: - Next.js with App Router - React - TypeScript with strict mode -
Tailwind CSS - shadcn/ui primitives where useful - Lucide icons -
Supabase PostgreSQL - Supabase Auth - Supabase Storage - Supabase Row
Level Security - React Hook Form for substantial interactive forms - Zod
for validation

Data fetching: - Prefer Server Components for server-rendered reads. -
Use server-side query functions for feature data access. - Use Client
Components only where browser interactivity is required. - Add TanStack
Query only if a concrete client-side asynchronous-state requirement
justifies it. Do not install or use it by default everywhere.

Testing: - Choose a modern test setup compatible with the selected
Next.js/React versions. - Unit test critical pure business logic. -
Integration test critical data/business workflows where practical. - Add
a small number of end-to-end tests for critical journeys.

Deployment target: - Vercel for the Next.js application. - Supabase for
database, auth, and storage. - GitHub as the source repository.

Package management: - Use one package manager consistently. - Commit the
lockfile. - Do not install dependencies without a clear need. - Prefer
platform/framework capabilities over unnecessary packages.

---

5. ARCHITECTURAL STYLE

Use a modular monolith.

The single Next.js application contains: - Public storefront - Customer
account - Admin panel - Server-side business logic - Supabase
integration

Do not create microservices.

Use feature-oriented organization. A recommended shape is:

src/ app/ features/ auth/ products/ categories/ cart/ checkout/ orders/
wishlist/ addresses/ search/ admin/ settings/ components/ ui/ layout/
shared/ lib/ supabase/ validation/ errors/ config/ hooks/ types/ utils/

This is guidance, not a requirement to create empty directories.

For a feature, create only the folders/files actually needed, for
example: - components/ - actions/ - queries/ - schemas/ - types/ -
utils/

Do not force every operation through Component -> Service -> Repository
-> Database. Use: - Simple read -> feature query function - Mutation ->
server action or server-side mutation function - Complex business
workflow -> dedicated service/domain function or PostgreSQL RPC when
atomic database behavior is required

Keep business rules out of React presentation components.

---

6. NEXT.JS RENDERING STRATEGY

Server Components are the default.

Prefer Server Components for: - Home - Product listing - Category
pages - Product detail pages - About - Contact - Initial admin data
rendering where appropriate

Use Client Components for focused interactive islands such as: - Variant
selector - Quantity controls - Add to Cart - Wishlist - Mobile
navigation - Search suggestions - Image interaction - Interactive
forms - Dialogs - Toasts

Do not add “use client” to large trees merely for convenience.

Public catalog pages should be SEO-friendly and fast. Choose
caching/revalidation deliberately. Do not cache personalized user data
as public data.

---

7. ROUTE ORGANIZATION

Use route groups/layouts where they improve clarity. A suggested
structure:

src/app/ (store)/ page.tsx products/ categories/ search/ cart/ checkout/
about/ contact/ (account)/ account/ profile/ addresses/ orders/
wishlist/ admin/ dashboard/ products/ categories/ orders/ customers/
import/ banners/ settings/ auth/ login/ callback/ verify/ api/ only when
a real HTTP endpoint is required

Layouts: - Store layout: header, mobile navigation as appropriate, main
content, footer - Account layout: store shell plus account navigation -
Admin layout: responsive admin navigation, header, content

Do not create API routes for operations that are better implemented as
server-side functions/actions. Use route handlers when an actual HTTP
boundary is needed.

---

8. AUTHENTICATION

Use Supabase Auth. Never implement a custom password or OTP system.

Preferred sign-in methods: 1. Google OAuth 2. Mobile phone OTP

Important distinction: - External business notifications are out of
scope. - Phone OTP authentication still requires a supported SMS
provider/configuration.

Therefore: - Implement the architecture and UI to support Google and
phone OTP. - Google authentication may be the first fully operational
method. - Phone OTP must only be considered operational after the
required provider and Supabase configuration exist. - Never fake OTP
sending or verification. - Document required manual configuration.

Login UX: - Continue with Google - Divider - Enter mobile number - Send
OTP - OTP verification step

Profile creation/synchronization: - Supabase auth.users remains the
authentication source. - Maintain an application profile row keyed to
auth.users.id. - Handle first login idempotently. - Do not assume every
user has both email and phone.

---

9. AUTHORIZATION AND SECURITY MODEL

Roles for v1: - customer - admin

Authentication and authorization are separate concerns.

Customer permissions: - Read public active catalog - Manage own
profile - Manage own addresses - Manage own cart - Manage own wishlist -
Create own orders through the approved checkout workflow - View own
orders

Admin permissions: - Manage products and variants - Manage categories -
Manage orders - View customer information needed for business
operations - Manage banners - Manage public store settings -
Import/export catalog

Protect admin access using defense in depth: - Server-side
authentication check - Role check - RLS/database authorization - Never
rely on hiding links or buttons

Do not expose service-role credentials to the browser.

Supabase clients should be clearly separated, for example:
lib/supabase/client.ts lib/supabase/server.ts lib/supabase/admin.ts

The service-role/admin client: - Server only - Used sparingly - Never
NEXT_PUBLIC - Never logged - Never committed - Never used merely to
bypass poorly designed RLS

Validate all untrusted input on the server.

Do not trust: - Client-calculated prices - Client-calculated totals -
Client-provided role - Client-provided ownership IDs - Client-provided
stock state

---

10. DATABASE MODEL

Use PostgreSQL migrations. Enable appropriate constraints, indexes,
foreign keys, and RLS.

Use UUID primary keys unless a strong reason exists otherwise. Use
timestamptz for timestamps. Use numeric(10,2) or an equally safe
exact-money representation consistently. Never use floating-point for
money. Use created_at and updated_at consistently where meaningful. Use
database constraints for invariants that belong in the database.

10.1 profiles

Fields: - id uuid primary key references auth.users(id) - full_name text
nullable initially if identity data is incomplete - phone text
nullable - email text nullable - avatar_url text nullable - is_active
boolean default true - created_at timestamptz - updated_at timestamptz

Do not require both phone and email.

10.2 user_roles

Fields: - id uuid primary key - user_id uuid foreign key to
profiles.id - role enum or constrained value: customer | admin -
created_at timestamptz

Enforce appropriate uniqueness so accidental duplicate role rows do not
create ambiguity.

10.3 addresses

Fields: - id uuid primary key - user_id uuid foreign key to
profiles.id - label text - full_name text - phone text - address_line_1
text - address_line_2 text nullable - landmark text nullable - city
text - district text - state text default ‘Tamil Nadu’ - postal_code
text - is_default boolean default false - created_at timestamptz -
updated_at timestamptz

Rules: - v1 delivery addresses must be in Tamil Nadu. - Enforce this
server-side; UI validation alone is insufficient. - Ensure a sensible
default-address strategy. - A customer may only manage their own
addresses.

10.4 categories

Fields: - id uuid primary key - name text - slug text unique -
description text nullable - image_url or storage_path text nullable -
parent_id uuid nullable references categories.id - sort_order integer
default 0 - is_active boolean default true - created_at timestamptz -
updated_at timestamptz

Subcategories are supported by schema but not required to be heavily
used in v1.

Suggested initial category normalization may include: - Oils - Hair
Care - Health Mixes - Traditional Snacks / Laddus - Powders / Podi -
Grocery - Honey - Pickles - Personal Care / Soaps

Do not force this exact taxonomy if the supplied catalog suggests a
cleaner normalization.

10.5 products

Fields: - id uuid primary key - category_id uuid foreign key to
categories.id - name text - slug text unique - short_description text
nullable - description text nullable - benefits text nullable -
ingredients text nullable - usage_instructions text nullable -
storage_instructions text nullable - shelf_life text nullable -
is_featured boolean default false - is_bestseller boolean default
false - status constrained value: draft | active | inactive - sort_order
integer default 0 - created_at timestamptz - updated_at timestamptz

Rules: - One product record represents the product concept. - Different
sizes/weights/options are variants, not duplicate products. - Do not
invent benefits, medical claims, ingredients, certifications, or
descriptions when the source data does not provide them.

10.6 product_variants

Fields: - id uuid primary key - product_id uuid foreign key to
products.id - name text - sku text unique nullable - value numeric
nullable - unit constrained value nullable: ml | l | g | kg | piece |
pack | other - price numeric(10,2) - compare_at_price numeric(10,2)
nullable - stock_quantity integer default 0 - track_inventory boolean
default true - is_default boolean default false - is_active boolean
default true - sort_order integer default 0 - created_at timestamptz -
updated_at timestamptz

Rules: - Support standard measurement variants such as 500 ml, 1 L, 300
g, 1 kg. - Also support non-measurement variants such as “With Oil” and
“Without Oil”. - Price must be non-negative. - Stock quantity must not
be negative unless an explicit, documented backorder policy is later
introduced. - At most one default active variant per product where
practical. - The UI should present a clear human-readable label.

10.7 product_images

Fields: - id uuid primary key - product_id uuid foreign key to
products.id - storage_path text - alt_text text nullable - is_primary
boolean default false - sort_order integer default 0 - created_at
timestamptz

Rules: - Store files in Supabase Storage; store paths/metadata in the
database. - Current expectation is one image, maximum around two for
most products, but do not enforce a hard database limit of two. - Ensure
a deterministic primary-image rule.

10.8 carts

Fields: - id uuid primary key - user_id uuid unique foreign key to
profiles.id - created_at timestamptz - updated_at timestamptz

One persistent cart per registered customer.

10.9 cart_items

Fields: - id uuid primary key - cart_id uuid foreign key to carts.id -
variant_id uuid foreign key to product_variants.id - quantity integer -
created_at timestamptz - updated_at timestamptz

Constraints: - unique(cart_id, variant_id) - quantity > 0

Adding an existing variant should update quantity rather than create a
duplicate row.

10.10 wishlists

Fields: - id uuid primary key - user_id uuid unique foreign key to
profiles.id - created_at timestamptz

10.11 wishlist_items

Fields: - id uuid primary key - wishlist_id uuid foreign key to
wishlists.id - product_id uuid foreign key to products.id - created_at
timestamptz

Constraint: - unique(wishlist_id, product_id)

Wishlist is product-level, not variant-level.

10.12 orders

Fields: - id uuid primary key - order_number text unique - user_id uuid
foreign key to profiles.id - status: placed | confirmed | packed |
shipped | delivered | cancelled - payment_method: cod | upi -
payment_status: pending | paid | failed | refunded - subtotal
numeric(10,2) - shipping_charge numeric(10,2) - discount_amount
numeric(10,2) default 0 - total_amount numeric(10,2) - customer_name
text - customer_phone text - customer_email text nullable -
shipping_address jsonb - customer_notes text nullable - admin_notes text
nullable - courier_name text nullable - tracking_number text nullable -
tracking_url text nullable - upi_transaction_reference text nullable -
payment_verified_at timestamptz nullable - payment_verified_by uuid
nullable - placed_at timestamptz - created_at timestamptz - updated_at
timestamptz

Rules: - Shipping address is an order-time snapshot and must not change
when the user’s saved address changes later. - Order number must be
human-friendly enough for support while remaining unique. - Do not
expose predictable internal IDs as the only customer-facing order
reference. - Validate legal status transitions in business logic. - UPI
starts pending until manually verified. - COD normally starts pending
and may be marked paid when appropriate. - Never allow the browser to
authoritatively set totals.

10.13 order_items

Fields: - id uuid primary key - order_id uuid foreign key to orders.id -
product_id uuid nullable - variant_id uuid nullable - product_name
text - variant_name text - sku text nullable - quantity integer -
unit_price numeric(10,2) - line_total numeric(10,2) - created_at
timestamptz

Rules: - Snapshot product/variant name and price at purchase time. -
Historical order display must remain correct after catalog edits or
price changes. - quantity > 0. - line totals must be derived/validated
server-side.

10.14 order_status_history

Fields: - id uuid primary key - order_id uuid foreign key to orders.id -
from_status nullable - to_status required - changed_by uuid nullable -
note text nullable - created_at timestamptz

Use for customer-visible tracking history and admin traceability.

10.15 site_settings

Fields: - id uuid primary key - key text unique - value jsonb -
description text nullable - is_public boolean default false - updated_at
timestamptz

Possible keys: - business.name - business.logo - business.phone -
business.email - business.address - branding.primary_color -
branding.secondary_color - shipping.default_charge -
shipping.free_shipping_threshold - payment.upi_id - payment.upi_qr -
social.instagram - social.facebook - store.ordering_enabled

Rules: - Do not expose all settings publicly. - Only explicitly public
settings may be read by anonymous users. - Secrets must never be stored
as publicly readable site settings. - Do not turn settings into an
untyped dumping ground. Centralize keys and validation.

10.16 banners

Fields: - id uuid primary key - title text - subtitle text nullable -
image storage path/url - link_type: product | category | external |
none - link_value text nullable - sort_order integer default 0 -
is_active boolean default true - starts_at timestamptz nullable -
ends_at timestamptz nullable - created_at timestamptz - updated_at
timestamptz

Validate link_type/link_value combinations.

10.17 homepage_sections

Fields: - id uuid primary key - section_type - title text nullable -
configuration jsonb - sort_order integer - is_enabled boolean default
true - created_at timestamptz - updated_at timestamptz

Supported initial section concepts: - hero - categories -
featured_products - best_sellers - product_category - why_choose_us -
brand_story - faq - contact

This is not a full page builder. Keep configuration typed and validated
per section type.

---

11. ROW LEVEL SECURITY

Enable RLS on user-sensitive/application tables as appropriate.

Required intent:

profiles: - User can read/update own profile. - Admin can access
customer profiles required for administration.

addresses: - Customer CRUD only their own addresses. - Admin access only
as needed for order support.

carts/cart_items: - Customer accesses only their own cart and items.

wishlists/wishlist_items: - Customer accesses only their own wishlist
and items.

orders/order_items/order_status_history: - Customer can read only their
own orders and related records. - Order creation must go through the
approved secure workflow. - Admin can read/update all orders as
required.

products/product_variants/product_images/categories: - Anonymous/public
users may read only active/published catalog data. - Admin can manage
catalog.

site_settings: - Anonymous users may read only settings explicitly
marked public and safe. - Admin manages settings.

banners/homepage_sections: - Public can read active/public content. -
Admin can manage.

Do not write permissive policies such as unrestricted “true” policies
merely to make development easier. Test RLS behavior for customer A vs
customer B and customer vs admin.

---

12. ORDER CREATION AND CHECKOUT — CRITICAL BUSINESS WORKFLOW

The browser must never be the authority for price, stock, shipping, or
totals.

Client sends only the minimum required intent, such as: - selected
address - cart/selected item identity - quantities - payment method -
UPI reference when required - customer note if supported

The server/database must: 1. Authenticate the user. 2. Load the user’s
current cart. 3. Load current active variants and products. 4. Validate
quantities. 5. Validate stock for inventory-tracked variants. 6. Fetch
current authoritative prices. 7. Fetch authoritative shipping
configuration. 8. Validate the Tamil Nadu delivery restriction. 9.
Calculate subtotal. 10. Calculate shipping. 11. Calculate total. 12.
Create the order. 13. Create immutable order-item snapshots. 14. Create
initial status history. 15. Deduct stock safely for tracked inventory. 16. Clear purchased cart items. 17. Return the order confirmation.

The critical write workflow must be atomic where practical. Prefer a
PostgreSQL function/RPC transaction or another robust transaction
strategy supported by the chosen architecture.

Prevent: - Partial orders - Double stock deduction - Negative stock
caused by races - Duplicate order creation caused by repeated
submission - Client price tampering

Use idempotency or submission protection where appropriate.

---

13. INVENTORY MODEL

This is simple inventory, not warehouse management.

Each variant has: - stock_quantity - track_inventory

If track_inventory = true: - stock <= 0 means unavailable/out of
stock. - Checkout must revalidate stock. - Concurrent order creation
must not oversell due to a race condition.

If track_inventory = false: - Product may continue to be ordered, useful
for made/prepared-on-demand items.

Admin can update stock per variant.

Do not implement inventory movement ledgers unless later requested.

---

14. SHIPPING MODEL

For v1: - Shipping is based on a configurable default courier charge. -
The customer must see the complete final amount before placing the
order. - Do not place an order and then surprise the customer with a
changed total later.

Initial calculation: subtotal + configured shipping charge - any
currently supported discount (discount engine is out of scope, so
normally zero) = total.

Architecture may leave room for future: - Free shipping threshold -
District-based pricing - Pincode-based pricing - Weight-based pricing -
Courier APIs

Do not implement those until requested.

---

15. PAYMENT WORKFLOWS

Cash on Delivery

Customer: - Selects COD. - Reviews complete order amount. - Places
order.

Initial payment status: - pending

Admin can update payment state according to the business process,
typically after delivery/payment receipt.

Manual UPI

Flow: 1. Customer selects UPI. 2. Display configured business UPI QR
code and UPI ID. 3. Show clear instructions. 4. Customer pays outside
the site using their UPI app. 5. Customer enters transaction reference. 6. Customer places the order. 7. Order payment status is pending. 8.
Admin manually verifies. 9. Admin marks payment paid and verification
metadata is recorded.

Do not claim that entering a transaction reference proves payment. Do
not fake payment verification. Do not integrate a gateway unless
requested later.

UPI configuration must be replaceable through admin/settings and
placeholder-friendly during development.

---

16. CUSTOMER EXPERIENCE AND PAGES

Required public/customer pages:

1.  Home
2.  Product listing / Shop
3.  Category browsing
4.  Product details
5.  Search results
6.  Cart
7.  Checkout
8.  Login / authentication
9.  Account overview/profile
10. Saved addresses
11. My orders
12. Order details/tracking
13. Wishlist
14. About Us
15. Contact Us
16. Privacy Policy
17. Terms & Conditions
18. Appropriate not-found and error experiences

Registered users are preferred for checkout. The v1 design may require
authentication before order placement.

Public visitors can: - Browse - Search - View product details

Registered customers can additionally: - Manage cart - Manage wishlist -
Manage addresses - Checkout - View order history and status - Manage
profile

---

17. HOMEPAGE

Recommended initial flow: 1. Optional announcement/trust strip 2. Header 3. Hero 4. Shop by Category 5. Featured Products 6. Best Sellers 7.
Highlighted category such as Cold-Pressed Oils 8. Why Choose Us 9. Brand
Story 10. Optional FAQ 11. Contact information 12. Footer

Rules: - Sections may be configurable, hideable, and reorderable without
creating a full page builder. - Do not show fake testimonials. - Do not
invent certifications. - Do not invent medical or health claims. - Do
not state “100% organic”, “chemical free”, “doctor recommended”, or
similar factual claims unless the business owner supplies and approves
them. - Placeholder copy must be clearly replaceable and should avoid
unsupported factual claims.

---

18. PRODUCT LISTING AND SEARCH

Initial catalog is small, roughly dozens rather than millions of
products.

Use a simple, fast solution: - Search by product name - Browse/filter by
category - Filter by availability where useful - Price filtering only if
it improves UX - Sort by relevance/name/price where meaningful

Do not add a dedicated external search engine for v1.

Product cards should prioritize: - Product image - Product name -
Available size/variant summary - Starting price when multiple prices
exist - Availability - Clear view/select action

If a product has multiple variants, do not accidentally add an arbitrary
variant from the card. Route to selection or provide an accessible
variant-selection interaction. If a product has one obvious variant,
quick add may be used.

Do not display fake ratings.

---

19. PRODUCT DETAIL PAGE

Mobile-first content priority: 1. Product image/gallery 2. Product name 3. Short description if available 4. Price 5. Variant selector 6. Stock
state 7. Quantity 8. Add to Cart 9. Buy Now if implemented cleanly 10.
Delivery/shipping information 11. Description 12. Benefits, only when
provided and appropriate 13. Ingredients, only when provided 14. Usage
instructions 15. Storage instructions 16. Shelf life 17. Related
products

Use accordions/sections where they improve mobile scanability.

Images: - One primary image - Optional secondary image - Optimized
responsive delivery - Meaningful alt text - Placeholder asset until real
photography is supplied

Do not build an unnecessarily complex gallery for one or two images.

---

20. CART

Required: - Product and selected variant - Quantity controls - Remove
item - Clear feedback for stock changes - Subtotal - Shipping
estimate/current configured shipping - Total - Checkout CTA - Empty-cart
state that guides the customer back to shopping

Revalidate price and stock on the server at checkout.

For authenticated persistence, use the database cart. If guest cart
behavior is later added, design migration/merge carefully; do not
silently create inconsistent duplicate items.

---

21. CHECKOUT UX

Keep checkout short:

Cart -> Sign in if required -> Select or add address -> Choose COD or
UPI -> Review complete price -> Place order -> Confirmation

Requirements: - Tamil Nadu address restriction clearly communicated. -
Full total visible before final submission. - Prevent duplicate
submissions. - Show clear loading state. - Show actionable validation
errors. - If stock/price changes, explain and require the customer to
review the updated order. - Do not lose the user’s cart on a failed
order attempt. - Clear the relevant cart only after successful order
creation.

---

22. CUSTOMER ACCOUNT

Provide: - Profile - Saved addresses - Orders - Order details/status
timeline - Wishlist - Logout

Order timeline may show: - Placed - Confirmed - Packed - Shipped -
Delivered - Cancelled where applicable

If courier tracking information exists: - Show courier name - Tracking
number - Safe tracking link

Do not fabricate live courier tracking.

---

23. ADMIN EXPERIENCE

The admin panel must be understandable to a non-technical business owner
and usable on mobile.

Primary navigation: - Dashboard - Products - Categories - Orders -
Customers - Import/Export - Banners - Website Settings - Profile

Do not add menu items with no real function.

Admin dashboard

Focus on actionable information: - Pending/new orders - Orders requiring
UPI payment verification - Low-stock products - Recent orders - Basic
sales summary - Quick actions

Do not add charts merely for decoration.

Product management

Admin can: - List/search/filter products - Add product - Edit product -
Manage variants - Manage stock - Upload/remove/reorder images - Set
primary image - Mark featured - Mark bestseller - Set
draft/active/inactive - Duplicate product if implemented safely -
Preview product

Product form grouping: 1. Basic information 2. Category 3.
Description/content 4. Variants 5. Images 6. Visibility/merchandising 7.
Preview/publish

Dynamic variants must be easy to manage on mobile and desktop.

Category management

Admin can: - Create/edit categories - Set image - Set active state - Set
ordering - Optionally assign parent category

Prevent destructive deletion that would leave invalid product
relationships. Prefer safe constraints and clear admin messaging.

Order management

Admin can: - Search/filter orders - View customer and address snapshot -
View item snapshots - View payment method/status - Verify UPI manually -
Update order status through valid transitions - Add admin notes - Add
courier name/tracking number/tracking URL - View status history

Use confirmations for important/destructive actions.

Customer management

Admin can: - View customer list - View basic customer profile - View
relevant order history

Do not expose unnecessary authentication internals or sensitive data.

Banners/settings

Admin can manage: - Placeholder/replacement logo - Business name -
Contact information - Public address - Default shipping charge - UPI
ID - UPI QR - Social links - Store ordering enabled/disabled if
implemented - Banners - Basic public branding configuration where
practical

Avoid allowing arbitrary configuration that can break the UI.

---

24. CATALOG IMPORT AND EXPORT

The supplied CSV/Excel product list is important.

Build an admin import workflow supporting CSV and XLSX where
practical: 1. Download sample template. 2. Upload file. 3. Parse safely. 4. Normalize headers and values. 5. Validate. 6. Preview proposed
products and variants. 7. Show row-level errors and warnings. 8. Confirm
import. 9. Import transactionally or in a safely recoverable way. 10.
Report results.

Do not blindly insert uploaded data.

Example errors: - Missing product name - Invalid price - Invalid
size/unit - Duplicate variant - Ambiguous product grouping

The import system should understand that repeated rows may represent
variants of the same product.

Normalize units carefully: - ml - L/litre/liter -> canonical l - g/gram
-> canonical g - kg/kilogram -> canonical kg - pieces/piece -> canonical
piece - unknown values -> require mapping or use explicit “other” with a
clear name

Do not silently convert ambiguous values.

The source catalog may contain custom variants that do not map to
numeric measurement units. Preserve them as named variants.

Initial seed/import: - Use the supplied product catalog as the source of
truth for product names, variant labels/sizes, and prices. - Do not
invent missing descriptions, categories, stock, SKU, images,
ingredients, or claims. - Normalize obvious formatting only. - Produce a
reviewable mapping before final seed insertion if the source is
ambiguous. - Use placeholder product images until real images are
provided. - Generate stable slugs safely. - Ensure rerunning seed/import
does not create uncontrolled duplicates.

Export: - Allow a practical catalog export to CSV/XLSX if implemented in
the import phase. - Preserve enough identifiers or stable keys for safe
future updates. - Document whether import supports create-only, update,
or upsert behavior.

---

25. DESIGN DIRECTION

The storefront should feel: - Natural - Premium - Calm - Trustworthy -
Modern - Uncluttered

Do not copy Amazon. Do not make it look like a default shadcn dashboard.
Do not overuse gradients, glassmorphism, animation, badges, or
decorative UI.

Brand assets are placeholders initially.

Preferred visual direction: - Forest green primary - Deep green strong
actions/headings - Sage green subtle highlights - Warm cream page
background - Natural beige secondary surfaces - White product surfaces -
Restrained semantic red/amber for errors/warnings

Implement colors as semantic design tokens/CSS variables rather than
scattered hardcoded values.

Create a coherent token system for: - Background - Foreground -
Surface/card - Muted - Border - Primary - Primary foreground -
Secondary - Accent - Success - Warning - Destructive - Focus ring

Use accessible contrast.

Typography: - Clean and highly readable. - Avoid overly decorative body
fonts. - Optimize for Tamil Nadu mobile users and common device sizes. -
If Tamil content is later added, typography must support Tamil
correctly.

Spacing: - Consistent scale. - Generous enough to feel premium without
wasting mobile space.

Corners/shadows: - Soft and restrained. - Avoid making every element a
floating card.

Motion: - Subtle and purposeful. - Respect prefers-reduced-motion. -
Never block interaction with decorative animation.

---

26. RESPONSIVE AND MOBILE-FIRST RULES

Mobile is the primary design target.

Requirements: - Design from small screens upward. - Touch targets should
generally be at least about 44px where appropriate. - No hover-only
essential interactions. - No horizontal page overflow. - Forms must work
with mobile keyboards. - Sticky actions must not cover content. -
Respect safe areas where relevant. - Product grids should adapt cleanly;
two columns on common mobile widths only when card content remains
readable. - Admin tables must have a deliberate mobile alternative, such
as cards, stacked rows, or horizontal overflow only when truly
appropriate.

Store navigation: - Compact mobile header. - Search must be easy to
access. - Cart badge visible. - A bottom navigation may be used for
high-frequency destinations such as Home, Shop, Search, Cart, Account if
it improves UX and does not conflict with other navigation.

Desktop: - Do not simply stretch mobile UI. - Use appropriate max
widths, grids, sidebars, and navigation. - Preserve the same information
architecture.

---

27. ACCESSIBILITY

Target strong practical accessibility and WCAG-aware implementation.

Required: - Semantic HTML - Correct heading hierarchy - Keyboard
navigation - Visible focus states - Proper labels and descriptions -
Accessible validation errors - Sufficient contrast - Meaningful alt
text - Accessible dialogs, menus, drawers, tabs, and accordions - No
information conveyed by color alone - Reduced-motion support - Sensible
screen-reader announcements for important dynamic feedback - Do not
disable zoom - Avoid placeholder-only form labels

Use accessible primitives but verify actual composition and focus
behavior.

---

28. APPLICATION STATES

Every important page/feature must deliberately handle: - Loading -
Empty - Error - Success - Unauthorized - Forbidden - Not found - Network
failure where relevant

Examples: - Empty cart guides back to products. - Empty wishlist guides
to browse. - No orders explains what will appear there. - No search
results offers recovery. - Product unavailable state prevents
purchase. - Admin empty states offer the relevant create/import action.

Use skeletons only where they improve perceived loading. Do not add
skeletons everywhere by habit.

---

29. IMAGES AND PLACEHOLDERS

Until final assets are supplied, use intentional local placeholders
for: - Logo - Product image - Hero/banner - Category image - UPI QR

Requirements: - Centralize placeholder references. - Make replacement
easy. - Do not permanently depend on random remote placeholder
services. - Do not generate fake product photography as if it were the
real product. - Use Next.js image optimization appropriately. -
Configure remote image domains only when actually needed.

Product images are expected to be one or two per product in most cases.

---

30. CONTENT INTEGRITY

Never invent: - Customer reviews - Testimonials presented as real -
Ratings - Certifications - Medical claims - Health treatment claims -
Ingredient lists - Manufacturing details - Shelf life - Organic
certification - “Chemical free” claims - “Doctor recommended” claims -
Business history - Exact sourcing claims

Use neutral placeholders or omit sections until real content is
provided.

---

31. FORMS AND VALIDATION

Use React Hook Form where it provides value. Use Zod for structured
validation.

Principles: - Client validation improves UX. - Server validation is
mandatory. - Share schemas where sensible, but do not couple
client/server code awkwardly. - Show errors next to relevant fields. -
Preserve user input after recoverable errors. - Disable/prevent
duplicate submission while submitting. - Confirm destructive
operations. - Warn about unsaved changes where losing significant admin
form work is likely.

Validate uploaded file type, size, and content.

---

32. ERROR HANDLING

Use consistent typed/structured application errors where appropriate,
such as: - VALIDATION_ERROR - UNAUTHORIZED - FORBIDDEN - NOT_FOUND -
CONFLICT - OUT_OF_STOCK - INTERNAL_ERROR

User-facing errors: - Clear - Specific when safe - Actionable - Never
leak stack traces, SQL, secrets, or internal implementation details

Developer logging: - Include enough context to diagnose failures. -
Never log secrets, access tokens, OTPs, service-role keys, or
unnecessary personal data.

Create error boundaries and not-found handling where useful.

---

33. PERFORMANCE

Priorities: - Fast mobile initial load - Minimal client JavaScript -
Server Components by default - Optimized images - Sensible
caching/revalidation - Avoid N+1 queries - Pagination for admin/customer
lists when needed - Lazy load non-critical heavy UI - Avoid giant
dependency bundles - Avoid fetching data the page does not use - Avoid
unnecessary global state - Avoid rerender-heavy component design

Measure rather than prematurely optimizing.

Public catalog pages should have good Core Web Vitals under realistic
mobile conditions.

---

34. SEO

Implement: - Meaningful page titles/descriptions - Product metadata -
Category metadata - Canonical URLs where needed - Open Graph metadata -
Sitemap - robots.txt - Clean slugs - Appropriate structured data for
products/business only when the data is accurate

Do not include fake ratings/review structured data. Do not index
admin/account/private pages. Handle inactive/draft products
appropriately.

---

35. STATE MANAGEMENT

Use the simplest appropriate mechanism.

Prefer: - Server state rendered by Server Components - Local component
state for local UI - URL/search params for shareable filter/search
state - Database-backed cart for authenticated users - Small context
only for truly cross-cutting client UI concerns

Do not add Redux/Zustand/TanStack Query simply because they are popular.
If a state library becomes necessary, document the concrete reason.

---

36. CODING STANDARDS

TypeScript: - strict mode - Avoid any - Do not use type assertions to
silence real problems - Prefer precise domain types - Generate/use
Supabase database types appropriately - Keep runtime validation at trust
boundaries

React: - Prefer composition - Keep components focused - Avoid giant page
components - Avoid premature abstraction - Do not create a generic
component for one trivial use - Reuse real repeated patterns - Keep
business logic out of presentation

Naming: - Consistent, descriptive names - Follow existing project
conventions - Avoid vague names such as data, item, thing, helper when a
domain name is clearer

Comments: - Explain why, constraints, and non-obvious decisions - Do not
narrate obvious code

Dependencies: - Check whether the platform or existing dependency
already solves the problem - Install only when justified - Avoid
overlapping libraries for the same job

Files: - Do not create empty architecture scaffolding - Keep modules
cohesive - Refactor when a file becomes difficult to understand, not
based on arbitrary line-count rules

---

37. DATABASE AND MIGRATION RULES

- All schema changes must be represented as migrations.
- Never edit production data manually as the only implementation.
- Migrations should be reviewable and safe.
- Add indexes based on actual query patterns.
- Use unique constraints for true uniqueness.
- Use check constraints for important invariants where appropriate.
- Define deletion behavior deliberately.
- Avoid destructive cascades that can erase historical order data.
- Historical orders must survive product/catalog changes.
- Seed scripts must be idempotent or clearly documented.
- Keep local/dev seed data separate from fabricated production claims.

---

38. ADMIN DESTRUCTIVE ACTIONS

Use safe behavior: - Prefer draft/inactive/archived-like states over
destructive deletion when records are referenced historically. - Never
delete order history because a product is deleted. - Prevent category
deletion when active references would become invalid, or provide a safe
reassignment workflow. - Confirm destructive actions. - Make
consequences clear.

---

39. TESTING STRATEGY

Do not chase 100% coverage.

Highest priority: - Authoritative price calculation - Shipping
calculation - Order creation - Order-item snapshots - Inventory
deduction - Race/concurrency-sensitive stock behavior where practical -
Authorization - RLS isolation - Product import
parsing/normalization/validation - Checkout validation - Tamil Nadu
address restriction - UPI pending-verification behavior

Medium priority: - Cart operations - Address validation - Product/admin
form validation - Order status transitions

Lower priority: - Purely decorative visual components

Critical E2E journeys: 1. Browse -> product -> select variant -> cart ->
login -> checkout -> order created. 2. Admin login -> create product
with variants -> publish -> product visible in store. 3. Customer A
cannot access Customer B’s private data. 4. Non-admin cannot access
admin functionality.

Tests must assert meaningful behavior, not implementation details.

---

40. ENVIRONMENT AND CONFIGURATION

Provide a clear .env.example containing variable names only, never real
secrets.

Validate required server environment variables at startup/build time
where practical.

Likely configuration includes: - Supabase project URL - Supabase
anonymous/publishable key as appropriate for the current SDK -
Server-only service role key only if truly needed - Site URL - Other
provider configuration only when actually introduced

Document: - Local setup - Supabase setup - Migration commands -
Seed/import process - Google OAuth setup - Phone OTP provider
requirement - Storage bucket setup - Admin bootstrap process - Vercel
deployment - Required redirect URLs

Never commit secrets.

---

41. INITIAL ADMIN BOOTSTRAP

Provide a secure, documented method to grant the first admin role.

Do not: - Make the first registered user automatically admin in
production. - Hardcode an admin email in client code. - Expose an
“become admin” action.

Use a controlled migration/SQL/manual bootstrap process documented for
the project owner.

---

42. IMPLEMENTATION PHASES

Phase 1 — Foundation

Deliver: - Initialize project if not already initialized - Strict
TypeScript - Tailwind - UI primitives - Semantic design tokens - Base
responsive layouts - Supabase client setup - Environment validation -
Error-handling foundation - Placeholder asset strategy - Basic
README/setup documentation

Do not build the full app in this phase.

Exit criteria: - App runs - Lint/typecheck/build pass - Store/admin
shell responsive - No secrets committed

Phase 2 — Database and Authentication

Deliver: - Database migrations for approved schema -
Constraints/indexes - RLS policies - Supabase generated types workflow -
Profile synchronization - Google authentication - Phone OTP
UI/architecture with honest provider requirements - Customer/admin
authorization - Protected account/admin routes - Secure first-admin
bootstrap documentation - Storage setup/migrations/policies as
appropriate

Exit criteria: - Customer isolation tested - Non-admin denied admin
access - Google auth flow configured as far as environment allows -
Phone OTP not falsely represented as operational without provider setup

Phase 3 — Catalog and Storefront

Deliver: - Home - Category browsing - Product listing - Product detail -
Variant selection - Search - Responsive header/navigation/footer -
Placeholder assets - Public catalog queries - SEO metadata foundations

Exit criteria: - Active catalog public - Draft/inactive catalog hidden -
Mobile and desktop layouts polished - No fake claims/reviews

Phase 4 — Shopping

Deliver: - Persistent authenticated cart - Wishlist - Addresses -
Checkout UI - Tamil Nadu restriction - COD selection - Manual UPI flow -
Authoritative server-side totals

Exit criteria: - Client tampering cannot change authoritative price -
Failed checkout preserves cart - Duplicate submission protection exists

Phase 5 — Orders

Deliver: - Atomic order creation workflow - Order-item snapshots -
Inventory deduction - Status history - Customer order history - Order
details/timeline - Courier tracking fields display

Exit criteria: - Critical order tests pass - Historical price snapshot
verified - Stock revalidated at purchase - Partial-order failure
scenario prevented

Phase 6 — Admin

Deliver: - Actionable dashboard - Product/variant CRUD - Category
management - Image upload - Order management - UPI verification -
Customer view - Banners - Site settings

Exit criteria: - Admin usable on mobile and desktop - Destructive
actions safe - Non-admin access denied at UI/server/database layers

Phase 7 — Import/Export and Initial Catalog

Deliver: - CSV/XLSX upload - Parsing - Normalization - Validation -
Preview - Row-level errors/warnings - Confirmed import - Sample
template - Practical export - Initial catalog normalization/seed based
on the supplied product file

Exit criteria: - Invalid files do not partially corrupt catalog -
Repeated product rows can become variants - Ambiguous source data is
surfaced, not silently guessed - Reruns do not create uncontrolled
duplicates

Phase 8 — Production Hardening

Deliver: - Critical tests - Accessibility review - SEO - Performance
review - Security review - Error/empty/loading states - Mobile polish -
Desktop polish - Documentation - Deployment checklist

Exit criteria: - Lint/typecheck/tests/build pass - No known critical
security issue - No placeholder secrets - Remaining placeholder
content/assets clearly documented - Manual production setup steps
documented

---

43. DEFINITION OF DONE FOR EACH FEATURE

A feature is not done merely because the happy-path UI renders.

For applicable features, done means: - Functional requirements
implemented - Server-side validation implemented - Authorization
checked - RLS considered - Loading state handled - Empty state handled -
Error state handled - Mobile behavior verified - Desktop behavior
verified - Keyboard/accessibility basics verified - Relevant tests
added - Types are sound - No unnecessary dependency added -
Documentation updated when setup/behavior changed - Lint/typecheck/build
remain healthy

---

44. DECISION-MAKING RULES FOR AMBIGUITY

When requirements are not specified: 1. Preserve the confirmed business
rules in this document. 2. Choose a conventional, simple, maintainable
default. 3. Avoid irreversible architecture based on speculation. 4.
Make user-facing business configuration configurable when it is
genuinely likely to change, but do not create a generic rules engine. 5.
Do not invent factual business content. 6. If ambiguity can cause money
loss, security risk, data loss, or a major UX/business decision, stop
and ask. 7. For minor implementation details, make a sensible decision
and document it.

Examples: - Button spacing: decide. - Internal helper naming: decide. -
Whether to charge an unknown extra courier amount after checkout: do not
invent; follow the confirmed fixed configured charge model. - Whether a
health claim is true: do not invent. - Whether to bypass RLS to make a
page work: do not do it.

---

45. AI/CODEX DEVELOPMENT RULES

You must: - Inspect before editing. - Keep a coherent plan. - Make
focused changes. - Reuse existing good code. - Avoid duplicate
components and utilities. - Avoid broad rewrites without need. - Keep
business logic testable. - Keep secrets server-side. - Validate at trust
boundaries. - Use the database for real invariants. - Preserve
historical order correctness. - Keep mobile UX first-class. - Keep admin
UX simple. - Keep documentation current. - Leave the repository in a
working state after each phase.

You must not: - Generate the entire application in one giant unreviewed
pass. - Add fake reviews, fake ratings, fake certifications, or
unsupported health claims. - Add packages “just in case.” - Build
marketplace, warehouse, GST, or notification systems in v1. - Use any as
an escape hatch. - Silence TypeScript/lint errors without understanding
them. - Disable security controls to make development easier. - Expose
service-role keys. - Trust browser totals. - Hardcode the final brand
identity into dozens of components. - Create empty folders and
abstractions solely to appear enterprise-grade. - Claim unverified
external integrations work. - Delete historical business data
casually. - Start the next major phase automatically when instructed to
complete only the current phase.

---

46. CURRENT PLACEHOLDERS AND ITEMS TO REPLACE LATER

The following are intentionally not finalized: - Business name - Logo -
Exact brand palette adjustments - Product photography - Hero/banner
photography - Category photography - UPI ID - UPI QR code - Business
contact details - Business address - Social links - Product
descriptions - Ingredients - Benefits - Usage instructions - Storage
instructions - Shelf life - Stock quantities - Final category taxonomy
where source data is ambiguous - Phone OTP provider configuration

Centralize placeholders and document replacement locations.

---

47. SOURCE PRODUCT CATALOG INSTRUCTIONS

A product CSV/Excel file is supplied separately by the project owner. It
contains the current product list with sizes/weights/options and prices.

When the file is available in the repository/workspace: 1. Inspect the
actual columns and data before writing import assumptions. 2. Preserve
the original source file unchanged. 3. Create a documented
normalization/mapping step. 4. Group rows into products and variants
based on evidence in the source. 5. Normalize obvious unit formatting. 6. Surface ambiguous rows for review. 7. Do not invent missing product
facts. 8. Produce a preview/report of: - normalized products -
variants - prices - inferred categories - warnings - unresolved rows 9.
Only then create final seed/import data. 10. Keep the importer reusable
for future catalog updates.

The current catalog is expected to contain examples of: - Products with
multiple ml/L sizes - Products with g/kg sizes - Products with
named/non-measurement options - Products with one or two expected photos
later

Do not assume every product has the same variant structure.

---

48. FINAL PRODUCT PRINCIPLE

Build a polished, secure, maintainable e-commerce product for a real
small business.

The correct target is not: “maximum architecture” or “maximum number of
features.”

The target is: - Excellent mobile shopping experience - Simple owner
administration - Correct order and money handling - Secure customer
data - Clean product/variant modeling - Easy future maintenance - Honest
content - Sensible room to grow

When implementation choices conflict, prefer correctness, simplicity,
security, maintainability, and customer clarity over novelty.

END OF MASTER PROJECT PROMPT
