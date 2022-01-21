import { Button, PageHeader } from "antd";
import { Link } from "react-router-dom";
import { ChatsList, ReviewsList } from "../../modules/";

import "./styles/index.scss";

export default function DashboardPage() {
  return (
    <>
      <PageHeader className="site-page-header" title="Dashboard" />
      <ChatsList
        title="Mesaje Recente"
        simplified
        extra={
          <div className="w-100 mt-1 d-flex justify-content-end">
            <Link to="/chats">
              <Button type="link">Vezi toata lista</Button>
            </Link>
          </div>
        }
      />
      <ReviewsList
        title="Testemoniale Recente"
        simplified
        extra={
          <div className="w-100 mt-1 d-flex justify-content-end">
            <Link to="/reviews">
              <Button type="link">Vezi toata lista</Button>
            </Link>
          </div>
        }
      />
    </>
  );
}
