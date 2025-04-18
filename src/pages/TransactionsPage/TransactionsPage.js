import { PageHeader, Card, Typography, Row, Col, Statistic } from "antd";
import { 
  TransactionOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from "@ant-design/icons";
import { useQuery } from "react-query";
import { TransactionsList } from "../../modules";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import api from "../../utils/appApi";
import "./styles/index.scss";

const { Title } = Typography;

export default function TransactionsPage() {
  usePermissionsRedirect();

  // Fetch transaction statistics from the API
  const {
    data: transactionsStats,
    isLoading: isLoadingStats
  } = useQuery("transactions-stats", () => api.stats.getTransactionsStats());

  // Create a stats object with the correct property names
  const stats = {
    total: transactionsStats?.all || 0,
    successful: transactionsStats?.paid || 0,
    pending: transactionsStats?.unpaid || 0,
    canceled: 0 // Not provided by the API, but keeping for UI consistency
  };

  return (
    <div className="transactions-page">
      <PageHeader 
        className="site-page-header" 
        title="Tranzacții" 
      />
      
      <div className="content-container">
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} loading={isLoadingStats}>
              <Statistic
                title="Total tranzacții"
                value={stats.total}
                prefix={<TransactionOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} loading={isLoadingStats}>
              <Statistic
                title="Tranzacții reușite"
                value={stats.successful}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} loading={isLoadingStats}>
              <Statistic
                title="În așteptare"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        <TransactionsList />
      </div>
    </div>
  );
}