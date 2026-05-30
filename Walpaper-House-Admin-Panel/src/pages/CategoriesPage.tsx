import { useState } from "react";
import { motion } from "motion/react";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useAdminCategories";
import { useToastStore } from "@/stores/toastStore";
import HeroHeader from "@/components/shared/HeroHeader";
import CategoryTable from "@/components/categories/CategoryTable";
import CategoryForm from "@/components/categories/CategoryForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Category } from "@/types/database";

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const { data: categories = [] } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      if (editCategory) {
        await updateMutation.mutateAsync({ id: editCategory.id, ...data });
        addToast("Category updated", "success");
      } else {
        await createMutation.mutateAsync(data as Parameters<typeof createMutation.mutateAsync>[0]);
        addToast("Category created", "success");
      }
      setShowForm(false);
      setEditCategory(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addToast("Category deleted", "success");
    } catch {
      addToast("Failed to delete", "error");
    }
    setDeleteId(null);
  };

  return (
    <motion.div {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}>
      <div className="flex items-center justify-between mb-6">
        <HeroHeader title="Categories" subtitle={`${categories.length} categories`} />
        <Button onClick={() => { setEditCategory(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Create Category
        </Button>
      </div>

      <div className="neomorphic p-4">
        <CategoryTable
          categories={categories}
          onEdit={(cat) => { setEditCategory(cat); setShowForm(true); }}
          onDelete={setDeleteId}
        />
      </div>

      <CategoryForm
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditCategory(null); }}
        category={editCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Category"
        description="This will permanently delete this category. Wallpapers in this category will become uncategorized."
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
