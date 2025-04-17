import { PageHeader } from "antd";
import { ReviewsList } from "../modules";
import usePermissionsRedirect from "../hooks/usePermissionsRedirect";

export default function ReviewsListPage() {
  usePermissionsRedirect();

  return (
    <div className="tw-space-y-6">
      <PageHeader 
        className="site-page-header tw-bg-white tw-rounded-lg tw-shadow-sm tw-mb-0" 
        title={<span className="tw-text-xl tw-font-semibold">Testimoniale</span>} 
        subTitle="Gestionarea recenziilor utilizatorilor" 
      />
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-6">
        <ReviewsList />
      </div>
    </div>
  );
}
