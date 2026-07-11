import { CheckCircle2, Circle, XCircle } from 'lucide-react';

import { OrderStatus } from '@foodiego/platform-sdk/src/order-status';

const TIMELINE_STEPS = [
  { status: OrderStatus.CREATED, label: 'Order Placed' },
  { status: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { status: OrderStatus.PREPARING, label: 'Preparing' },
  { status: OrderStatus.READY, label: 'Ready' },
  { status: OrderStatus.DELIVERING, label: 'Delivering' },
  { status: OrderStatus.COMPLETED, label: 'Delivered' },
];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center space-x-3 text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">
        <XCircle className="w-6 h-6" />
        <span className="font-semibold">This order has been cancelled</span>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.findIndex(step => step.status === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0; // Fallback to 0 if unknown

  return (
    <div className="relative py-4">
      <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200" />
      <div className="space-y-6 relative">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div key={step.status} className="flex items-center space-x-4">
              <div className="relative z-10 flex items-center justify-center bg-white">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500 bg-white" />
                ) : isActive ? (
                  <Circle className="w-8 h-8 text-primary fill-primary/10 bg-white" />
                ) : (
                  <Circle className="w-8 h-8 text-gray-300 bg-white" />
                )}
              </div>
              <div className={`flex-1 ${isActive ? 'font-semibold text-primary' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
