import { Button, PageHeader, Spin, Tabs, Card, Typography, Avatar, Tag, Row, Col } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DoctorViewContext } from "./DoctorViewContext";
import GeneralInformationTab from "./tabs/GeneralInformationTab";
import { useHistory } from "react-router-dom";
import ChatsTab from "./tabs/ChatsTab";
import ReferralSystemTab from "./tabs/ReferralSystemTab";
import TransactionsTab from "./tabs/TransactionsTab";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import cs from "../../utils/classNames";
import api from "../../utils/appApi";
import { DoctorForm, DoctorBalanceModal } from "../../modules";
import { ReactComponent as ExLink } from "../../asstets/icons/ex-link.svg";
import { 
  UserOutlined, 
  MessageOutlined, 
  ClockCircleOutlined, 
  LikeOutlined, 
  WalletOutlined,
  TransactionOutlined,
  TeamOutlined,
  BankOutlined
} from "@ant-design/icons";

import "./styles/index.scss";
import MedicalCentreTab from "./tabs/MedicalCentreTab";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function DoctorViewPage() {
  usePermissionsRedirect();

  const { doc_id } = useParams();
  const [editVisible, setEditVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const history = useHistory();
  const queryClient = useQueryClient();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: docInfoData, isLoading: loading } = useQuery({
    queryKey: ["doctor-by-id"],
    queryFn: () => api.doctors.getById(doc_id),
    onError: () => {
      if (history.action !== "POP") history.goBack();
      else history.push("/chats");
    },
  });

  const docInfo = docInfoData?.data || {};

  const updateDocInfo = useCallback(
    (key, value) => {
      const newDocInfo = { ...docInfo };

      newDocInfo[key] = value;
    },
    [docInfo]
  );

  const getStatusTag = () => {
    if (docInfo?.inVacation) return <Tag color="orange">În vacanță</Tag>;
    if (docInfo?.isOnline) return <Tag color="green">Online</Tag>;
    return <Tag color="default">Offline</Tag>;
  };

  return (
    <div className={cs("page-view", docInfo?.inVacation && "closed")}>
      <Spin spinning={loading}>
        <Card 
          className="doctor-profile-header"
          bordered={false}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={6} lg={4}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src={docInfo?.avatar ? `https://api.doctorchat.md/uploads/avatars/${docInfo.avatar}` : null} 
                className="doctor-avatar"
              />
            </Col>
            <Col xs={24} md={18} lg={20}>
              <div className="doctor-info">
                <div className="doctor-title">
                  <Title level={3} className="doctor-name">
                    {docInfo?.name || "Loading..."}
                    <span className="doctor-status">{getStatusTag()}</span>
                  </Title>
                  <Text type="secondary" className="doctor-specialty">
                    {docInfo?.card?.specialization?.ro || ""}
                    {docInfo?.card?.title ? ` · ${docInfo?.card?.title}` : ""}
                  </Text>
                </div>
                
                <div className="doctor-stats">
                  <Row gutter={16}>
                    <Col>
                      <Stat icon={<MessageOutlined />} value={docInfo?.card?.helped || 0} label="Consultații" />
                    </Col>
                    <Col>
                      <Stat icon={<LikeOutlined />} value={docInfo?.card?.likes?.like || 0} label="Aprecieri" />
                    </Col>
                    <Col>
                      <Stat icon={<ClockCircleOutlined />} value={docInfo?.card?.response_time || "-"} label="Timp răspuns" />
                    </Col>
                  </Row>
                </div>
                
                <div className="doctor-actions">
                  <Button key="doc-view-balance" type="default" icon={<WalletOutlined />} onClick={() => setBalanceModalVisible(true)}>
                    Balanță
                  </Button>
                  <Button key="doc-view-edit" type="primary" onClick={() => setEditVisible(true)}>
                    Editează
                  </Button>
                  <Button key="doc-view-back" onClick={history.goBack}>
                    Înapoi
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <DoctorForm
          onClose={() => setEditVisible(false)}
          submitBtnText="Salvează"
          visible={editVisible}
          defaultValues={docInfo}
          docId={doc_id}
        />

        <Card className="doctor-tabs-container" bordered={false}>
          <DoctorViewContext.Provider value={{ docInfo, updateDocInfo }}>
            <Tabs type="card" className="doctor-tabs">
              <TabPane 
                tab={<span><UserOutlined />Informație generală</span>}
                key="general-information"
              >
                <GeneralInformationTab />
              </TabPane>
              <TabPane 
                tab={<span><MessageOutlined />Chat-uri</span>}
                key="chats"
              >
                <ChatsTab />
              </TabPane>
              <TabPane 
                tab={<span><TransactionOutlined />Tranzacții</span>}
                key="transactions"
              >
                <TransactionsTab />
              </TabPane>
              <TabPane 
                tab={<span><TeamOutlined />Referral system</span>}
                key="referral-system"
              >
                <ReferralSystemTab />
              </TabPane>
              <TabPane 
                tab={<span><BankOutlined />Centre medicale</span>}
                key="medical-centre"
              >
                <MedicalCentreTab />
              </TabPane>
              {docInfo?.support_chat && (
                <TabPane
                  tab={
                    <>
                      <div
                        role="tab"
                        aria-selected="false"
                        className="ant-tabs-tab-btn"
                        tabIndex="0"
                        id="rc-tabs-1-tab-support"
                        aria-controls="rc-tabs-1-panel-support"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          window.open(`/support/${docInfo.support_chat}`, "_blank").focus();
                        }}
                      >
                        <ExLink width={16} height={16} className="me-1" />
                        Support Chat
                      </div>
                    </>
                  }
                  key="support"
                />
              )}
            </Tabs>
          </DoctorViewContext.Provider>
        </Card>
        
        {/* Doctor Balance Modal */}
        <DoctorBalanceModal
          visible={balanceModalVisible}
          onClose={() => setBalanceModalVisible(false)}
          doctor={docInfo}
          onSuccess={() => {
            // Refetch the doctor data to update the balance
            queryClient.invalidateQueries(["doctor-by-id"]);
          }}
        />
      </Spin>
    </div>
  );
}

// Statistic component
function Stat({ icon, value, label }) {
  return (
    <div className="stat-item">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}