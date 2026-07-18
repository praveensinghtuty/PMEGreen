import { EmptyState } from "@/components/storefront/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ProductInformationProps = {
  details: {
    label: string;
    value: string | null;
  }[];
};

export function ProductInformation({ details }: ProductInformationProps) {
  const visibleDetails = details.filter(
    (detail): detail is { label: string; value: string } =>
      Boolean(detail.value),
  );

  if (visibleDetails.length === 0) {
    return (
      <EmptyState
        description="Additional product information has not been provided yet. No claims or details are invented."
        title="Details pending"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {visibleDetails.map((detail) => (
        <Card key={detail.label}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{detail.label}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {detail.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
