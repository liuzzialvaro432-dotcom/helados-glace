"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCustomer } from "@/lib/store";

export function OrderHereButton({ branchId, branchName }: { branchId: number; branchName: string }) {
  const router = useRouter();
  const update = useCustomer((state) => state.update);
  return (
    <Button
      size="lg"
      className="h-11 rounded-full px-5"
      onClick={() => {
        update({ branchId });
        toast.success(`Tu pedido sale de ${branchName}`);
        router.push("/#menu");
      }}
    >
      Pedir acá
    </Button>
  );
}
