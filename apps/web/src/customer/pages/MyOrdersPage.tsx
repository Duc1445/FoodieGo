import { FeatureUnavailable } from '../../shared/components/FeatureUnavailable';

export function MyOrdersPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <FeatureUnavailable 
        title="Order History" 
        description="The order history feature is currently under development and will be available in Sprint 2B."
      />
    </div>
  );
}
