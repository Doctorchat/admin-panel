import { Card, PageHeader, Tabs } from "antd";
import { ActiveCalls, ClosedCalls, OnholdCalls } from "./tabs";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import "./styles/index.scss";

export default function CallsPage() {
  usePermissionsRedirect({ allowedRoles: [4] });

  return (
    <div className="calls-page">
      <PageHeader title="Apeluri" className="site-page-header" />
      <Card className="calls-card">
        <Tabs
          type="card"
          defaultActiveKey="1"
          items={[
            { key: "1", label: "În așteptare", children: <OnholdCalls /> },
            { key: "2", label: "În curs", children: <ActiveCalls /> },
            { key: "3", label: "Finisate", children: <ClosedCalls /> },
          ]}
        />
      </Card>
    </div>
  );
}
