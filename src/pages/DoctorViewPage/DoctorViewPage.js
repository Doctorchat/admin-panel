import { Button, PageHeader, Spin, Tabs } from "antd";
import { useQuery } from "react-query";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { DoctorViewContext } from "./DoctorViewContext";
import GeneralInformationTab from "./tabs/GeneralInformationTab";
import { useHistory } from "react-router-dom";
import ChatsTab from "./tabs/ChatsTab";
import ReferralSystemTab from "./tabs/ReferralSystemTab";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import cs from "../../utils/classNames";
import api from "../../utils/appApi";
import { DoctorForm } from "../../modules";
import { ReactComponent as ExLink } from "../../asstets/icons/ex-link.svg";

import "./styles/index.scss";
import MedicalCentreTab from "./tabs/MedicalCentreTab";

const { TabPane } = Tabs;

export default function DoctorViewPage() {
  usePermissionsRedirect();

  const { doc_id } = useParams();
  const [editVisible, setEditVisible] = useState(false);
  const history = useHistory();

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

  return (
    <div className={cs("page-view", docInfo?.inVacation && "closed")}>
      <Spin spinning={loading}>
        <PageHeader
          className="site-page-header"
          onBack={history.goBack}
          title="Doctor"
          extra={[
            <Button key="doc-view-edit" type="primary" size="small" onClick={() => setEditVisible(true)}>
              Editează
            </Button>,
          ]}
        />
        <DoctorForm
          onClose={() => setEditVisible(false)}
          submitBtnText="Salvează"
          visible={editVisible}
          defaultValues={docInfo}
          docId={doc_id}
        />
        <DoctorViewContext.Provider value={{ docInfo, updateDocInfo }}>
          <Tabs>
            <TabPane tab="Informație generală" key="general-information">
              <GeneralInformationTab />
            </TabPane>
            <TabPane tab="Chat-uri" key="chats">
              <ChatsTab />
            </TabPane>
            <TabPane tab="Referral system" key="referral-system">
              <ReferralSystemTab />
            </TabPane>
            <TabPane tab="Centre medicale" key="medical-centre">
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
      </Spin>
    </div>
  );
}
