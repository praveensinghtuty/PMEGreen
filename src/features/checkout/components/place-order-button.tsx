"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function PlaceOrderButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={disabled || pending} type="submit">
      {pending ? "Placing order..." : "Place order"}
    </Button>
  );
}
