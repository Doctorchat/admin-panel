import { Tabs, Spin, Card, Avatar, Row, Col, Typography, Badge, Breadcrumb, Button } from "antd";
import { 
  HomeOutlined, 
  UserOutlined, 
  MessageOutlined, 
  TeamOutlined, 
  WalletOutlined,
  TransactionOutlined, 
  CreditCardOutlined,
  BankOutlined
} from "@ant-design/icons";
import { lazy, Suspense, useCallback, useState, useEffect } from "react";
import { useMount } from "react-use";
import { useParams, useHistory } from "react-router-dom";
import { useQueryClient } from "react-query";
import api from "../../utils/appApi";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import date from "../../utils/date";
import { UserBalanceModal } from "../../modules";

import "./styles/index.scss";

// Lazy load tab components
const GeneralInformationTab = lazy(() => import("./tabs/GeneralInformationTab"));
const ChatsTab = lazy(() => import("./tabs/ChatsTab"));
const ReferralSystemTab = lazy(() => import("./tabs/ReferralSystemTab"));
const TransactionsTab = lazy(() => import("./tabs/TransactionsTab"));
const PaymentsTab = lazy(() => import("./tabs/PaymentsTab"));
const TopupsTab = lazy(() => import("./tabs/TopupsTab"));

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Loading component for tab content
const TabLoading = () => (
  <div className="tab-loading">
    <Spin size="large" />
  </div>
);

export default function UserViewPage() {
  usePermissionsRedirect();

  const { user_id } = useParams();
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("general-information");
  const history = useHistory();
  const queryClient = useQueryClient();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await api.users.getById(user_id);
      setUserInfo(response.data);
    } catch (error) {
      if (history.action !== "POP") history.goBack();
      else history.push("/chats");
    } finally {
      setLoading(false);
    }
  }, [history, user_id]);

  useMount(fetchUserInfo);

  const isOnline = userInfo.last_seen ? 
    new Date(userInfo.last_seen) > new Date(Date.now() - 5 * 60 * 1000) : false;

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const renderTabContent = () => {
    // Only render the active tab content
    return (
      <Suspense fallback={<TabLoading />}>
        {activeTab === "general-information" && <GeneralInformationTab userInfo={userInfo} />}
        {activeTab === "chats" && <ChatsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "topups" && <TopupsTab />}
        {activeTab === "referral-system" && <ReferralSystemTab />}
      </Suspense>
    );
  };

  return (
    <div className="user-view-page">
      <Breadcrumb className="user-breadcrumb">
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/users">
          <TeamOutlined />
          <span>Utilizatori</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <span>{userInfo.name || 'Utilizator'}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Spin spinning={loading}>
        <Card className="user-header-card">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={6} md={4} lg={3}>
              <Badge dot status={isOnline ? "success" : "default"} offset={[-5, 5]}>
                <Avatar 
                  size={100} 
                  src={userInfo.avatar !== "default.png" ? userInfo.avatar : null} 
                  className="user-avatar"
                >
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <UserOutlined />}
                </Avatar>
              </Badge>
            </Col>
            <Col xs={24} sm={18} md={20} lg={21}>
              <div className="user-header-content">
                <div className="user-header-info">
                  <Title level={3} className="user-name">{userInfo.name}</Title>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary">Telefon:</Text>
                      <Text strong className="user-detail"> {userInfo.phone || '---'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary">Email:</Text>
                      <Text strong className="user-detail"> {userInfo.email || '---'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary">Ultima accesare:</Text>
                      <Text strong className="user-detail"> {userInfo.last_seen ? date(userInfo.last_seen).full : 'Necunoscut'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary">Întrebări adresate:</Text>
                      <Text strong className="user-detail"> {userInfo.questions_count || 0}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary">Balanță:</Text>
                      <Text strong className="user-detail"> {userInfo.wallet?.balance || 0} MDL</Text>
                    </Col>
                    {userInfo.wallet?.frozen > 0 && (
                      <Col xs={24} sm={12} md={8}>
                        <Text type="secondary">Balanță blocată:</Text>
                        <Text type="warning" strong className="user-detail"> {userInfo.wallet?.frozen} MDL</Text>
                      </Col>
                    )}
                  </Row>
                </div>
                
                <div className="user-header-actions">
                  <Button 
                    type="primary" 
                    icon={<WalletOutlined />} 
                    onClick={() => setBalanceModalVisible(true)}
                  >
                    Gestionează balanța
                  </Button>
                  <Button 
                    onClick={history.goBack}
                  >
                    Înapoi
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="user-tabs-card">
          <Tabs 
            activeKey={activeTab}
            onChange={handleTabChange}
            size="large"
            destroyInactiveTabPane
          >
            <TabPane 
              tab={<span><UserOutlined />Informație generală</span>} 
              key="general-information"
            />
            
            <TabPane 
              tab={<span><MessageOutlined />Chat-uri</span>} 
              key="chats"
            />
            
            <TabPane 
              tab={<span><TransactionOutlined />Tranzacții</span>} 
              key="transactions"
            />
            
            <TabPane 
              tab={<span><CreditCardOutlined />Plăți</span>} 
              key="payments"
            />
            
            <TabPane 
              tab={<span><BankOutlined />Alimentări</span>} 
              key="topups"
            />
            
            <TabPane 
              tab={<span><TeamOutlined />Referral system</span>} 
              key="referral-system"
            />
          </Tabs>
          
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </Card>
        
        {/* User Balance Modal */}
        <UserBalanceModal
          visible={balanceModalVisible}
          onClose={() => setBalanceModalVisible(false)}
          user={userInfo}
          onSuccess={() => {
            // Refetch the user data to update the balance
            fetchUserInfo();
          }}
        />
      </Spin>
    </div>
  );
}