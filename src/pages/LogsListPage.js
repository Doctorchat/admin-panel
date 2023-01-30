import { PageHeader } from "antd";
import { LogsList } from "../modules";
import usePermissionsRedirect from "../hooks/usePermissionsRedirect";

export default function ReviewsListPage() {
  usePermissionsRedirect();

  return (
    <>
      <PageHeader className="site-page-header" title="Istoricul" />
      <LogsList />
    </>
  );
}
