import { useState } from "react";
import { Plus, Wrench, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { formatCurrency } from "@/lib/utils";

export default function ServicesCMS() {
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Service Catalogue CMS</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage 15 service categories, starting prices, estimated durations, and FAQs
          </p>
        </div>

        <Button variant="accent" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert("Add Category modal opened!")}>
          Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-5 border border-border space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h4 className="font-heading text-sm font-bold text-primary">{cat.name}</h4>
                  <span className="text-[10px] text-foreground-muted block">{cat.count} Services Available</span>
                </div>
              </div>

              <Badge variant="accent" className="text-[10px]">From {formatCurrency(cat.startingPrice)}</Badge>
            </div>

            <p className="text-xs text-foreground-secondary line-clamp-2">{cat.description}</p>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => alert(`Editing category ${cat.name}`)}>
                Edit Category
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
