import { PageHeader, Card } from "antd";
import { LogsList } from "../modules";
import usePermissionsRedirect from "../hooks/usePermissionsRedirect";

export default function LogsListPage() {
  usePermissionsRedirect();

  return (
    <>
      <PageHeader className="site-page-header" title="Istoricul" />
      <Card bordered={false} className="shadow-sm">
        <LogsList />
      </Card>
    </>
  );
}
