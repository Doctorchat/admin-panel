import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Descriptions, Empty, Tabs, Tag, Card, Row, Col, Typography, Divider, Avatar } from "antd";
import { UserOutlined, ClockCircleOutlined, PhoneOutlined, MailOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import InvestigationCard from "../../../components/InvestigationCard";
import date from "../../../utils/date";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function GeneralInformationTab(props) {
  const { userInfo } = props;
  const [tabsPosition, setTabsPosition] = useState("left");

  const getLastSeen = () => {
    if (userInfo.isOnline) {
      return <Tag color="#06f">Online</Tag>;
    }

    return userInfo?.last_seen ? date(userInfo.last_seen).full : "Necunoscut";
  };

  useEffect(() => {
    const updateTabsPosition = () => {
      if (window.innerWidth < 721) {
        setTabsPosition("top");
      } else {
        setTabsPosition("left");
      }
    };

    window.addEventListener("resize", updateTabsPosition);

    updateTabsPosition();

    return () => window.removeEventListener("resize", updateTabsPosition);
  }, []);

  return (
    <div className="general-info-tab">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Date personale" className="user-info-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="info-item">
                  <UserOutlined className="info-icon" />
                  <Text type="secondary">Nume:</Text>
                  <Text strong>{userInfo?.name || "---"}</Text>
                </div>
                <Divider className="info-divider" />
              </Col>
              <Col span={24}>
                <div className="info-item">
                  <MailOutlined className="info-icon" />
                  <Text type="secondary">Email:</Text>
                  <Text strong>{userInfo?.email || "---"}</Text>
                </div>
                <Divider className="info-divider" />
              </Col>
              <Col span={24}>
                <div className="info-item">
                  <PhoneOutlined className="info-icon" />
                  <Text type="secondary">Telefon:</Text>
                  <Text strong>{userInfo?.phone || "---"}</Text>
                </div>
                <Divider className="info-divider" />
              </Col>
              <Col span={24}>
                <div className="info-item">
                  <QuestionCircleOutlined className="info-icon" />
                  <Text type="secondary">Întrebări adresate:</Text>
                  <Text strong>{userInfo?.questions_count || "0"}</Text>
                </div>
                <Divider className="info-divider" />
              </Col>
              <Col span={24}>
                <div className="info-item">
                  <ClockCircleOutlined className="info-icon" />
                  <Text type="secondary">Ultima accesare:</Text>
                  <Text strong>{getLastSeen()}</Text>
                </div>
              </Col>
              {userInfo?.referrer && (
                <Col span={24}>
                  <Divider className="info-divider" />
                  <div className="info-item referrer-item">
                    <Text type="secondary">Invitat de:</Text>
                    <Link to={`/user/${userInfo.referrer?.id}`} className="referrer-link">
                      <Avatar 
                        size="small" 
                        src={userInfo.referrer.avatar !== "default.png" ? userInfo.referrer.avatar : null}
                        icon={<UserOutlined />} 
                      />
                      <Text strong>{userInfo.referrer?.name}</Text>
                    </Link>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Portofel" className="wallet-info-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="info-item">
                  <Text type="secondary">ID Portofel:</Text>
                  <Text strong>{userInfo?.wallet?.id || "---"}</Text>
                </div>
                <Divider className="info-divider" />
              </Col>
              <Col span={24}>
                <div className="info-item">
                  <Text type="secondary">Balanță:</Text>
                  <Text strong className="balance-value">{userInfo?.wallet?.balance || 0} MDL</Text>
                </div>
                {userInfo?.wallet?.frozen > 0 && (
                  <>
                    <Divider className="info-divider" />
                    <div className="info-item">
                      <Text type="secondary">Balanță blocată:</Text>
                      <Text type="warning" strong className="balance-value">{userInfo?.wallet?.frozen} MDL</Text>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Învestigări</Divider>
      
      <div className="investigations-container">
        {userInfo?.investigations?.length ? (
          userInfo.investigations.map((invg) => (
            <InvestigationCard key={invg.id} investigation={invg} />
          ))
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="Nu sunt învestigări disponibile" 
            className="empty-investigations"
          />
        )}
      </div>
    </div>
  );
}

GeneralInformationTab.propTypes = {
  userInfo: PropTypes.object,
};