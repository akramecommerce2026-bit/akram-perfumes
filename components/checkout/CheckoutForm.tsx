"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Lock, ShoppingBag } from "lucide-react";

import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderReview } from "@/components/checkout/OrderReview";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentOptions } from "@/components/checkout/PaymentOptions";
import { useCart } from "@/components/cart/cart-context";
import { computeCheckoutTotals, DEFAULT_PAYMENT_METHOD } from "@/lib/checkout";
import {
  createOrderAction,
  verifyPaymentAction,
  type CreateOrderActionResult,
} from "@/lib/checkout-actions";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout-schema";
import { formatMoney } from "@/lib/money";
import { useMounted } from "@/lib/use-mounted";

type CheckoutStep = "details" | "review";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById("razorpay-checkout-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("details");
  const [isPlacing, setIsPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Stable per order-creation attempt so a network retry can't create duplicates;
  // reset when the customer goes back to edit their details.
  const idempotencyKey = useRef<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      paymentMethod: DEFAULT_PAYMENT_METHOD,
    },
  });

  const totals = useMemo(() => computeCheckoutTotals(items), [items]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleContinue() {
    setStep("review");
    scrollToTop();
  }

  function handleEdit() {
    setStep("details");
    idempotencyKey.current = null; // details changed → a fresh order next submit
    scrollToTop();
  }

  function finishSuccess(orderNumber: string) {
    clearCart();
    router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`);
  }

  async function startRazorpay(
    orderId: string,
    orderNumber: string,
    payment: Extract<CreateOrderActionResult, { ok: true }>["payment"],
  ) {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setSubmitError("Couldn't load the payment gateway. Please try again.");
      setIsPlacing(false);
      return;
    }
    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Akram Perfumes",
      description: `Order ${orderNumber}`,
      order_id: payment.razorpayOrderId,
      prefill: payment.prefill,
      theme: { color: "#c8962a" },
      handler: (response) => {
        void (async () => {
          const verified = await verifyPaymentAction({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          if (verified.ok) finishSuccess(verified.orderNumber);
          else {
            setSubmitError(verified.error);
            setIsPlacing(false);
          }
        })();
      },
      modal: {
        ondismiss: () => {
          setIsPlacing(false);
          setSubmitError("Payment was cancelled. You can retry when you're ready.");
        },
      },
    });
    checkout.open();
  }

  async function placeOrder(values: CheckoutFormValues) {
    setIsPlacing(true);
    setSubmitError(null);
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

    try {
      const result = await createOrderAction({
        contact: { fullName: values.fullName, email: values.email, mobile: values.mobile },
        address: {
          line1: values.line1,
          line2: values.line2 || "",
          landmark: values.landmark || "",
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          country: values.country,
        },
        billingSameAsShipping: true,
        paymentMethod: values.paymentMethod,
        lines: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        idempotencyKey: idempotencyKey.current,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setIsPlacing(false);
        return;
      }

      await startRazorpay(result.orderId, result.orderNumber, result.payment);
    } catch {
      setSubmitError("Something went wrong placing your order. Please try again.");
      setIsPlacing(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(step === "details" ? handleContinue : placeOrder)(event);
  }

  // Wait for cart hydration before deciding the cart is empty (avoids a flash).
  if (!mounted) {
    return <div className="min-h-[40vh]" aria-hidden="true" />;
  }

  if (items.length === 0 && !isPlacing) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-accent">
          <ShoppingBag className="size-9" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Add a fragrance to your cart before proceeding to checkout.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const ctaLabel = step === "details" ? "Review Order" : "Place Order";

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_20rem] md:items-start lg:grid-cols-[1fr_24rem] xl:grid-cols-[1fr_26rem]">
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait" initial={false}>
            {step === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                <AddressForm />
                <PaymentOptions />
              </motion.div>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <OrderReview values={form.getValues()} onEdit={handleEdit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside aria-label="Order summary" className="md:sticky md:top-28">
          <OrderSummary items={items} totals={totals}>
            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isPlacing}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {isPlacing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Placing order…
                </>
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>
            {step === "review" ? (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to details
              </button>
            ) : (
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Return to cart
              </Link>
            )}
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden="true" />
              Secure, encrypted checkout
            </p>
          </OrderSummary>
        </aside>

        {/* Mobile sticky action bar (hidden once the summary sidebar appears) */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-page items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-heading text-lg font-semibold text-foreground">
                {formatMoney(totals.total)}
              </span>
            </div>
            <button
              type="submit"
              disabled={isPlacing}
              className="ml-auto inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {isPlacing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : ctaLabel}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
