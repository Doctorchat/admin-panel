import { Tabs, Spin, Card, Avatar, Row, Col, Typography, Badge, Breadcrumb, Button } from "antd";
import { HomeOutlined, UserOutlined, MessageOutlined, TeamOutlined, WalletOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { useMount } from "react-use";
import { useParams, useHistory } from "react-router-dom";
import { useQueryClient } from "react-query";
import GeneralInformationTab from "./tabs/GeneralInformationTab";
import ChatsTab from "./tabs/ChatsTab";
import ReferralSystemTab from "./tabs/ReferralSystemTab";
import api from "../../utils/appApi";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import date from "../../utils/date";
import { UserBalanceModal } from "../../modules";

import "./styles/index.scss";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function UserViewPage() {
  usePermissionsRedirect();

  const { user_id } = useParams();
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const history = useHistory();
  const queryClient = useQueryClient();

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

  const isOnline = new Date(userInfo.last_seen) > new Date(Date.now() - 5 * 60 * 1000);

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
          <Tabs defaultActiveKey="general-information" size="large">
            <TabPane 
              tab={<span><UserOutlined />Informație generală</span>} 
              key="general-information"
            >
              <GeneralInformationTab userInfo={userInfo} />
            </TabPane>
            
            <TabPane 
              tab={<span><MessageOutlined />Chat-uri</span>} 
              key="chats"
            >
              <ChatsTab />
            </TabPane>
            
            <TabPane 
              tab={<span><TeamOutlined />Referral system</span>} 
              key="referral-system"
            >
              <ReferralSystemTab />
            </TabPane>
          </Tabs>
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