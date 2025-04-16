import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { 
  SearchOutlined, 
  UserOutlined, 
  FilterOutlined, 
  DollarOutlined, 
  MedicineBoxOutlined, 
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  PlusOutlined,
  TeamOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { 
  Alert, 
  Badge, 
  Button, 
  Input, 
  PageHeader, 
  Table, 
  Card, 
  Avatar, 
  Typography, 
  Tag, 
  Space, 
  Row, 
  Col,
  Dropdown,
  Menu,
  Statistic,
  Tooltip 
} from "antd";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";

import date from "../utils/date";
import api from "../utils/appApi";
import useTableState from "../hooks/usePaginatedQueryState";
import useDebounce from "../hooks/useDebounce";
import { useSelector } from "react-redux";
import moment from "moment";

import "./styles/doctors-list.scss";

const { Title, Text } = Typography;

export default function DoctorsList() {
  // Helper function to get vacation information including period and remaining days
  const getVacationInfo = (vacationData) => {
    if (!vacationData || vacationData === "[]" || vacationData === "") 
      return { isOnVacation: false, period: "", remainingDays: 0 };
    
    try {
      const vacationDates = JSON.parse(vacationData);
      if (!Array.isArray(vacationDates) || vacationDates.length === 0) 
        return { isOnVacation: false, period: "", remainingDays: 0 };
      
      const today = moment().format("DD.MM.YYYY");
      const currentDate = moment(today, "DD.MM.YYYY");
      
      // For a date range
      if (vacationDates.length === 2 && !Array.isArray(vacationDates[0])) {
        const startDate = moment(vacationDates[0], "DD.MM.YYYY");
        const endDate = moment(vacationDates[1], "DD.MM.YYYY");
        
        const isOnVac = currentDate.isBetween(startDate, endDate, null, '[]'); // inclusive range
        const period = `${vacationDates[0]} - ${vacationDates[1]}`;
        
        // Calculate remaining days
        let remainingDays = 0;
        if (isOnVac) {
          remainingDays = endDate.diff(currentDate, 'days');
        }
        
        return { isOnVacation: isOnVac, period, remainingDays };
      }
      
      // For specific dates
      const isOnVac = vacationDates.includes(today);
      // For single date, remaining days is 0 if it's today
      return { 
        isOnVacation: isOnVac, 
        period: vacationDates.join(", "),
        remainingDays: 0 // If it's just today or specific dates, there are 0 days remaining
      };
    } catch (e) {
      console.error("Error parsing vacation data:", e);
      return { isOnVacation: false, period: "", remainingDays: 0 };
    }
  };
  
  // Helper function to check if doctor is currently on vacation
  const isOnVacation = (vacationData) => {
    return getVacationInfo(vacationData).isOnVacation;
  };
  const { requestsCount } = useSelector((store) => ({
    requestsCount: store.requestsCount,
  }));

  const { page, sortColumn, sortDirection, setPage, onTableChange } = useTableState("doctors-list");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [displayHiddenDoctors] = useState(new URLSearchParams(window.location.search).has("hidden"));

  const {
    data: doctors,
    isLoading,
    isError,
  } = useQuery(["doctors", page, sortColumn, sortDirection, debouncedSearch, displayHiddenDoctors], () =>
    api.doctors.get({
      page,
      sort_column: sortColumn,
      sort_direction: sortDirection === "ascend" ? "asc" : "desc",
      search: debouncedSearch,
      hidden: displayHiddenDoctors ? 1 : 0,
    })
  );

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

  // Fetch statistics data for the stat boxes
  const { data: statistics } = useQuery(["statistics"], () => api.stats.getStatistics(), {
    refetchOnWindowFocus: false,
  });

  const sortMenu = (
    <Menu>
      <Menu.Item key="id" onClick={() => onTableChange({ sorter: { columnKey: 'id', order: sortDirection === 'ascend' ? 'descend' : 'ascend' } })}>
        <SortAscendingOutlined /> ID {sortColumn === 'id' && (sortDirection === 'ascend' ? '↑' : '↓')}
      </Menu.Item>
      <Menu.Item key="balance" onClick={() => onTableChange({ sorter: { columnKey: 'balance', order: sortDirection === 'ascend' ? 'descend' : 'ascend' } })}>
        <DollarOutlined /> Balanță {sortColumn === 'balance' && (sortDirection === 'ascend' ? '↑' : '↓')}
      </Menu.Item>
      <Menu.Item key="sales" onClick={() => onTableChange({ sorter: { columnKey: 'sales', order: sortDirection === 'ascend' ? 'descend' : 'ascend' } })}>
        <DollarOutlined /> Vânzări {sortColumn === 'sales' && (sortDirection === 'ascend' ? '↑' : '↓')}
      </Menu.Item>
      <Menu.Item key="requests" onClick={() => onTableChange({ sorter: { columnKey: 'requests', order: sortDirection === 'ascend' ? 'descend' : 'ascend' } })}>
        <TeamOutlined /> Solicitări {sortColumn === 'requests' && (sortDirection === 'ascend' ? '↑' : '↓')}
      </Menu.Item>
    </Menu>
  );

  if (isError) {
    return <Alert className="mt-5" showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }

  return (
    <div className="doctors-list-container">
      <Card className="doctors-header-card">
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4} className="page-title">
              <MedicineBoxOutlined className="page-title-icon" /> 
              {`Doctori ${displayHiddenDoctors ? "ascunși" : ""}`}
              <Tag color="blue" className="doctor-count-tag">{doctors?.total || 0}</Tag>
            </Title>
          </Col>
          <Col xs={24} md={12} className="header-actions">
            <Space size="middle">
              <Badge count={requestsCount.count} showZero>
                <Link to="/requests">
                  <Button type="primary">Cereri</Button>
                </Link>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      {statistics && (
        <div className="statistics-row">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Total doctori" 
                  value={doctors?.total || 0} 
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Balanța doctorilor" 
                  value={statistics?.general?.doctorsBalance || 0} 
                  suffix="MDL"
                  precision={2}
                  prefix={<DollarOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Balanța utilizatorilor" 
                  value={statistics?.general?.usersBalance || 0} 
                  suffix="MDL"
                  precision={2}
                  prefix={<DollarOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Cereri doctori" 
                  value={requestsCount.count || 0}
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <Card className="doctors-content-card">
        <div className="search-container">
          <Input
            placeholder="Caută doctor după nume sau email"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            allowClear
          />
        </div>

        <Table
          className="doctors-table"
          rowKey={(record) => record.id}
          dataSource={doctors?.data || []}
          loading={isLoading}
          pagination={{
            position: ["bottomRight"],
            current: doctors?.current_page || 1,
            pageSize: doctors?.per_page || 20,
            total: doctors?.total || 0,
            showSizeChanger: false,
          }}
          onChange={onTableChange}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: "Doctor",
              key: "doctor",
              fixed: "left",
              width: 280,
              render: (record) => (
                <Link to={`/doctor/${record.id}`} className="doctor-link">
                  <div className="doctor-info">
                    <Avatar 
                      size={50} 
                      icon={<UserOutlined />} 
                      src={record.avatar ? `https://api.doctorchat.md/uploads/avatars/${record.avatar}` : null} 
                      className="doctor-avatar" 
                    />
                    <div className="doctor-details">
                      <Text strong className="doctor-name">{record.name}</Text>
                      <Text type="secondary" className="doctor-specialty">{record.speciality}</Text>
                      {isOnVacation(record.vacation) && (
                        <div style={{ marginTop: 4 }}>
                          <Tooltip title={`${getVacationInfo(record.vacation).period}${
                            getVacationInfo(record.vacation).remainingDays > 0 
                              ? `\n\nRevine peste ${getVacationInfo(record.vacation).remainingDays} zile` 
                              : ""
                          }`}>
                            <Tag color="orange">
                              <CalendarOutlined /> În concediu 🌴
                            </Tag>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ),
            },
            {
              title: "Contact",
              key: "contact",
              width: 240,
              render: (record) => (
                <div className="contact-info">
                  <div className="contact-item">
                    <MailOutlined className="contact-icon" />
                    <Text>{record.email}</Text>
                  </div>
                  <div className="contact-item">
                    <PhoneOutlined className="contact-icon" />
                    <Text>{record.phone || "N/A"}</Text>
                  </div>
                </div>
              ),
            },
            {
              title: "Financiar",
              key: "financial",
              width: 200,
              render: (record) => (
                <div className="financial-info">
                  <Tooltip title="Balanță curentă">
                    <div className="financial-item">
                      <Tag color="blue" icon={<DollarOutlined />} className="financial-tag">
                        Sold: {record.balance} MDL
                      </Tag>
                    </div>
                  </Tooltip>
                  <Tooltip title="Vânzări totale">
                    <div className="financial-item">
                      <Tag color="green" icon={<DollarOutlined />} className="financial-tag">
                        Vânzări: {record.sales} MDL
                      </Tag>
                    </div>
                  </Tooltip>
                </div>
              ),
            },
            {
              title: "Solicitări",
              key: "requests",
              width: 180,
              render: (record) => (
                <div className="requests-info">
                  <div className="requests-item">
                    <Tag color="purple" className="requests-tag">
                      Total: {record.requests || 0}
                    </Tag>
                  </div>
                  <div className="requests-item">
                    <Tag color="orange" className="requests-tag">
                      Repetate: {record.repeat_requests || 0}
                    </Tag>
                  </div>
                </div>
              ),
            },
            {
              title: "Ultima activitate",
              key: "activity",
              width: 180,
              render: (record) => (
                <div className="activity-info">
                  <div className="activity-item">
                    <ClockCircleOutlined className="activity-icon" />
                    <Text>{record.last_seen ? date(record.last_seen).full : "Necunoscut"}</Text>
                  </div>
                  {record.isOnline && <Tag color="success">Online</Tag>}
                </div>
              ),
            },
            {
              title: "Acțiuni",
              key: "actions",
              fixed: "right",
              width: 120,
              render: (record) => (
                <div className="actions-container">
                  <Link to={`/doctor/${record.id}`}>
                    <Button type="primary" size="small">
                      Vizualizare
                    </Button>
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

DoctorsList.propTypes = {
  simplified: PropTypes.bool,
  title: PropTypes.string,
  extra: PropTypes.element,
};