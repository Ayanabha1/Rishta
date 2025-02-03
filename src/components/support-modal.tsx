"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Contact Support</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h3 className="font-medium text-purple-900">Address</h3>
            <p className="text-sm text-gray-600">
              4 NETAJI SUBHAS ROAD, 2ND FLOOR, ROOM NO -2, KOLKATA, Kolkata,
              West Bengal (700001)
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-purple-900">Phone</h3>
            <p className="text-sm text-gray-600">+91-7604027770</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-purple-900">Email</h3>
            <p className="text-sm text-gray-600">srijitasteel@gmail.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
