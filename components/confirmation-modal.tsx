import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
}

export const ConfirmModal = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
            <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-sm bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                    No
                </Button>
                <Button
                    onClick={() => {
                        onConfirm();
                        onOpenChange(false);
                    }}
                    className="flex-1 bg-transparent text-sm sm:text-base"
                >
                    Yes
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


