import usePermissionsRedirect from "../hooks/usePermissionsRedirect";
import { UsersList } from "../modules";
import { Typography } from "antd";

const { Title } = Typography;

export default function UsersListPage() {
  usePermissionsRedirect({ allowedRoles: [5] });

  return (
    <div className="container">
      <Title level={2} style={{ marginBottom: 16 }}>Utilizatori</Title>
      <UsersList />
    </div>
  );
}