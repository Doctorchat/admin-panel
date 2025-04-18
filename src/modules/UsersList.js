import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { 
  SearchOutlined, 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FireOutlined
} from "@ant-design/icons";
import { 
  Alert, 
  Input, 
  Card, 
  Table, 
  Tag, 
  Avatar, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic
} from "antd";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";

import date from "../utils/date";
import api from "../utils/appApi";
import useTableState from "../hooks/usePaginatedQueryState";
import useDebounce from "../hooks/useDebounce";

import "./styles/users-list.scss";

const { Title, Text } = Typography;

export default function UsersList() {
  const { user } = useSelector((state) => ({
    user: state.user.payload,
  }));
  const { page, sortColumn, sortDirection, setPage, onTableChange } = useTableState("users-list");
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch users data
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery(["users", page, pageSize, sortColumn, sortDirection, debouncedSearch], () =>
    api.users.get({
      page,
      per_page: pageSize,
      sort_column: sortColumn,
      sort_direction: sortDirection === "ascend" ? "asc" : "desc",
      search: debouncedSearch
    })
  );

  // Fetch users info data (statistics)
  const {
    data: usersInfo,
    isLoading: isLoadingInfo,
    isError: isErrorInfo,
  } = useQuery("users-info", () => api.users.getInfo());

  useDebounce(
    () => {
      if (search.length > 2) {
        setDebouncedSearch(search);
        setPage(1);
      } else {
        setDebouncedSearch("");
      }
    },
    500,
    [search]
  );


  const isUserActive = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInDays = Math.floor((now - lastSeenDate) / (1000 * 60 * 60 * 24));
    return diffInDays < 30;
  };

  const renderUserName = (name, id, avatar) => {
    return (
      <Space>
        <Avatar 
          src={avatar !== "default.png" ? avatar : null}
          icon={!avatar || avatar === "default.png" ? <UserOutlined /> : null}
          style={{ backgroundColor: !avatar || avatar === "default.png" ? '#1890ff' : 'transparent' }}
        >
          {name ? name.charAt(0).toUpperCase() : <UserOutlined />}
        </Avatar>
        {user?.role === 5 ? 
          <Text>{name}</Text> : 
          <Link to={`/user/${id}`}>{name}</Link>
        }
      </Space>
    );
  };


  if (isErrorUsers || isErrorInfo) {
    return <Alert className="mt-5" showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
      sortOrder: sortColumn === "id" && sortDirection,
      roles: [1, 5],
      width: 80
    },
    {
      title: "Nume",
      dataIndex: "name",
      render: (name, record) => renderUserName(name, record.id, record.avatar),
      roles: [1, 5],
    },
    {
      title: "Contact",
      dataIndex: "contact",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.email && (
            <Space>
              <MailOutlined />
              <Text>{record.email}</Text>
            </Space>
          )}
          {record.phone && (
            <Space>
              <PhoneOutlined />
              <Text>{record.phone}</Text>
            </Space>
          )}
        </Space>
      ),
      roles: [1, 5],
    },
    {
      title: "Regiune",
      dataIndex: "region",
      render: (region) => (
        <Space>
          <GlobalOutlined />
          <Text>{region || "Necunoscut"}</Text>
        </Space>
      ),
      roles: [1],
    },
    {
      title: "Activitatea utilizatorului",
      dataIndex: "activity",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <QuestionCircleOutlined />
            <Text>{record.tickets || 0} Chaturi</Text>
          </Space>
          <Space>
            <DollarOutlined />
            <Text>{record.revenue || 0} MDL</Text>
          </Space>
        </Space>
      ),
      roles: [1],
    },
    {
      title: "Status",
      dataIndex: "last_seen",
      render: (lastSeen) => {
        const active = isUserActive(lastSeen);
        return (
          <div>
            <Tag color={active ? "success" : "default"}>
              {active ? "Activ" : "Inactiv"}
            </Tag>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {lastSeen ? date(lastSeen).full : "Necunoscut"}
              </Text>
            </div>
          </div>
        );
      },
      roles: [1],
    },
    {
      title: "Referrals",
      dataIndex: "referrals_count",
      render: (count) => (
        <Tag color={count > 0 ? "blue" : "default"}>
          {count || 0}
        </Tag>
      ),
      roles: [1],
    }
  ].filter((column) => user?.role === 1 || column.roles.includes(user?.role));

  const userInfoData = usersInfo?.data || {
    total_users: 0,
    active_today: 0,
    active_last_30_days: 0,
    active_from_start_of_year: 0
  };

  return (
    <div className="users-list-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card" loading={isLoadingInfo}>
            <Statistic 
              title="Total utilizatori" 
              value={userInfoData.total_users} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card" loading={isLoadingInfo}>
            <Statistic 
              title="Activi astăzi" 
              value={userInfoData.active_today} 
              valueStyle={{ color: '#722ed1' }} 
              prefix={<FireOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card" loading={isLoadingInfo}>
            <Statistic 
              title="Activi (30 zile)" 
              value={userInfoData.active_last_30_days} 
              valueStyle={{ color: '#52c41a' }} 
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card" loading={isLoadingInfo}>
            <Statistic 
              title="Activi anul curent" 
              value={userInfoData.active_from_start_of_year} 
              valueStyle={{ color: '#1890ff' }} 
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card className="tools-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24}>
            <Input
              size="large"
              placeholder="Caută după nume sau telefon"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      <Card className="users-table-card">
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={users?.data || []}
          loading={isLoadingUsers}
          pagination={{
            position: ["bottomRight"],
            current: page,
            pageSize: pageSize,
            total: users?.meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} utilizatori`,
            onChange: (currentPage, currentPageSize) => {
              setPage(currentPage);
              setPageSize(currentPageSize);
            }
          }}
          onChange={(pagination, filters, sorter) => {
            // Only handle sorting in onTableChange
            if (sorter && sorter.order) {
              onTableChange(pagination, filters, sorter);
            }
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) => isUserActive(record.last_seen) ? 'active-user-row' : ''}
        />
      </Card>
    </div>
  );
}

UsersList.propTypes = {
  simplified: PropTypes.bool,
  title: PropTypes.string,
  extra: PropTypes.element,
};