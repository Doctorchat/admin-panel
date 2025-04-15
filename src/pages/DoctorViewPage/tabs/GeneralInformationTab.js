import { Alert, Badge, Avatar, Descriptions, Empty, List, Tabs, Tag, Typography, Card, Rate, Divider, Row, Col } from "antd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useMount } from "react-use";
import api from "../../../utils/appApi";
import date from "../../../utils/date";
import { useDoctorViewContext } from "../DoctorViewContext";
import { CalendarOutlined, DollarOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined, UserOutlined, BankOutlined, ReadOutlined } from "@ant-design/icons";

const daysNaming = {
  mon: { name: "Luni", ord: 1 },
  tue: { name: "Marți", ord: 2 },
  wed: { name: "Miercuri", ord: 3 },
  thu: { name: "Joi", ord: 4 },
  fri: { name: "Vineri", ord: 5 },
  sat: { name: "Sâmbătă", ord: 6 },
  sun: { name: "Duminică", ord: 7 },
};

const { TabPane } = Tabs;
const { Text, Paragraph } = Typography;

export default function GeneralInformationTab() {
  const { docInfo } = useDoctorViewContext();
  const { doc_id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tabsPosition, setTabsPosition] = useState("left");

  const fetchDocReviews = useCallback(async () => {
    try {
      const response = await api.doctors.getReviews(doc_id);
      setReviews(response.data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [doc_id]);

  useMount(fetchDocReviews);

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

  const getLastSeen = () => {
    if (docInfo.isOnline) {
      return <Tag color="success">Online</Tag>;
    }

    return docInfo?.last_seen ? date(docInfo.last_seen).full : "Necunoscut";
  };

  const DocDisponibility = useMemo(() => {
    const disponibility = [];

    if (docInfo?.card?.disponibility) {
      if (Array.isArray(docInfo.card.disponibility)) {
        return [];
      }

      Object.entries(docInfo.card.disponibility).forEach(([day, range]) => {
        if (range.every(Boolean)) {
          const dayConfig = daysNaming[day];
          disponibility.push({
            name: dayConfig.name,
            value: range.join(" - "),
            ord: dayConfig.ord,
          });
        }
      });

      return disponibility.sort((a, b) => a.ord - b.ord);
    }
  }, [docInfo?.card?.disponibility]);

  return (
    <Tabs tabPosition={tabsPosition} className="doc-view-left-tabs doctor-info-tabs">
      <TabPane tab="Date principale" key="doc-info-main-data">
        <Card bordered={false} className="info-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Informații personale" className="info-card">
                <div className="info-item">
                  <UserOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Nume</Text>
                    <div className="info-value">{docInfo?.name || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <MailOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Email</Text>
                    <div className="info-value">{docInfo?.email || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <PhoneOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Telefon</Text>
                    <div className="info-value">{docInfo?.phone || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <ClockCircleOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Ultima accesare</Text>
                    <div className="info-value">{getLastSeen()}</div>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Informații financiare" className="info-card">
                <div className="info-item">
                  <DollarOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Sold curent</Text>
                    <div className="info-value highlight">{docInfo?.card?.balance ? `${docInfo?.card?.balance} Lei` : "---"}</div>
                  </div>
                </div>
                
                {docInfo?.card_regions?.map(({ public_meet_price, public_price, region_name, currency_code }, index) => (
                  <div key={`region-${index}`}>
                    <Divider orientation="left" orientationMargin="0" plain>
                      {region_name}
                    </Divider>
                    <div className="info-item">
                      <DollarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Preț conferintă</Text>
                        <div className="info-value">{public_meet_price} {currency_code}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <DollarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Preț mesaj</Text>
                        <div className="info-value">{public_price} {currency_code}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {docInfo?.card?.companies_program && (
                  <div className="info-item">
                    <DollarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Preț program corporativ</Text>
                      <div className="info-value">{docInfo?.card?.companies_price} MDL</div>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
            
            <Col xs={24}>
              <Card title="Program de lucru" className="info-card">
                {DocDisponibility?.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {DocDisponibility.map((item, index) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={`day-${index}`}>
                        <div className="schedule-item">
                          <CalendarOutlined className="schedule-icon" />
                          <div>
                            <div className="schedule-day">{item.name}</div>
                            <div className="schedule-hours">{item.value}</div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="Nu-s date" />
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </TabPane>
      
      <TabPane tab="Activitate" key="doc-info-acitvity">
        <Card bordered={false} className="info-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Statistici" className="info-card">
                <div className="info-item">
                  <UserOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Oameni ajutați</Text>
                    <div className="info-value highlight">{docInfo?.card?.helped || "0"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <Rate className="info-icon" count={1} defaultValue={1} disabled />
                  <div>
                    <Text type="secondary">Utilizatori mulțumiți</Text>
                    <div className="info-value">
                      <Text type="success">Likes: {docInfo?.card?.likes?.like || "0"}</Text>
                      {" | "}
                      <Text type="danger">Dislikes: {docInfo?.card?.likes?.dislike || "0"}</Text>
                    </div>
                  </div>
                </div>
                <div className="info-item">
                  <ClockCircleOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Timp de răspuns</Text>
                    <div className="info-value">{docInfo?.card?.response_time || "---"}</div>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Detalii profesionale" className="info-card">
                <div className="info-item">
                  <BankOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Locul de muncă</Text>
                    <div className="info-value">{docInfo?.card?.workplace || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <ReadOutlined className="info-icon" />
                  <div>
                    <Text type="secondary">Educație</Text>
                    <div className="info-value">
                      {docInfo?.card?.studies?.length ? (
                        <List
                          size="small"
                          dataSource={docInfo?.card?.studies}
                          rowKey={(item) => item}
                          renderItem={(item) => (
                            <List.Item className="education-item">{item}</List.Item>
                          )}
                        />
                      ) : (
                        "---"
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </TabPane>
      
      <TabPane tab="Despre" key="doc-info-about">
        <Card bordered={false} className="info-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Profil profesional" className="info-card">
                <div className="info-item">
                  <div className="info-icon-placeholder" />
                  <div>
                    <Text type="secondary">Ani experientă</Text>
                    <div className="info-value">{docInfo?.card?.experience || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon-placeholder" />
                  <div>
                    <Text type="secondary">Titlul Profesional</Text>
                    <div className="info-value">{docInfo?.card?.title || "---"}</div>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon-placeholder" />
                  <div>
                    <Text type="secondary">Specializare</Text>
                    <div className="info-value">{docInfo?.card?.specialization?.ro || "---"}</div>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Specialitate" className="info-card">
                {docInfo?.card?.speciality?.length ? (
                  <List
                    size="small"
                    dataSource={docInfo?.card?.speciality || []}
                    renderItem={(item) => (
                      <List.Item className="specialty-item">
                        <Tag color="blue">{item.name_ro}</Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Nu-s date" />
                )}
              </Card>
            </Col>
            
            <Col xs={24}>
              <Card title="Despre doctor" className="info-card">
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "Vezi mai mult" }} className="bio-text">
                  {docInfo?.card?.bio?.ro || "Nu există informații"}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>
      </TabPane>
      
      <TabPane tab="Recenzii" key="doc-info-reviews">
        <Card bordered={false} className="info-section">
          {error ? (
            <Alert showIcon type="error" message="Error" description="A apărut o eroare!" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={reviews?.data || []}
              loading={loading}
              className="reviews-list"
              locale={{
                emptyText: <Empty description="Nu-s date" />,
              }}
              renderItem={(item) => (
                <List.Item className="review-item">
                  <Card bordered={false} className="review-card">
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar ? `https://api.doctorchat.md/uploads/avatars/${item.avatar}` : null} size={50} />}
                      title={<Link to={`/user/${item.user.id}`} className="review-author">{item.user.name}</Link>}
                      description={
                        <div>
                          <div className="review-date">
                            <ClockCircleOutlined /> {item.created_at ? date(item.created_at).full : ""}
                          </div>
                          <Paragraph className="review-content">{item.content}</Paragraph>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Card>
      </TabPane>
    </Tabs>
  );
}
