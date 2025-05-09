import { Alert, Button, notification, PageHeader, Popconfirm } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useMount } from "react-use";
import { DcTable } from "../components";
import { DoctorForm } from "../modules";
import { updateRequestsCount } from "../store/actions/requestsCountAction";
import api from "../utils/appApi";
import usePermissionsRedirect from "../hooks/usePermissionsRedirect";

export default function DoctorsRequestsPage() {
  usePermissionsRedirect();

  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [selectedDoctorData, setSelectedDoctorData] = useState(null);
  const [prepareAcceptLoading, setPrepareAcceptLoading] = useState(null);
  const [removeReqLoading, setRemoveReqLoading] = useState(null);
  const history = useHistory();
  const dispatch = useDispatch();

  const fetcher = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.doctors.getRequests({ page: currentPage });
      setRequests(response.data);
    } catch (error) {
      if (error.response.status === 500) {
        setError({
          status: error.response.status,
          message: error.response.data.message,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useMount(fetcher);

  const closeAcceptDrawer = useCallback(() => {
    setAcceptVisible(false);
    setSelectedDoctorData(null);
    dispatch(updateRequestsCount());
  }, [dispatch]);

  const onAcceptDocHanlder = useCallback((docData) => {
    setRequests((prev) => prev.filter((req) => req.id !== docData?.user_id));
  }, []);

  const acceptHandler = useCallback(
    (docId) => async () => {
      setPrepareAcceptLoading(docId);

      try {
        const response = await api.doctors.getById(docId);

        setSelectedDoctorData(response.data);
        setAcceptVisible(true);
      } catch (error) {
        notification.error({ message: "Eroare", description: "A apărut o eroare" });
      } finally {
        setPrepareAcceptLoading(null);
      }
    },
    []
  );

  const removeHandler = useCallback(
    (docId) => async () => {
      setRemoveReqLoading(docId);

      try {
        await api.doctors.removeRequest(docId);
        setRequests((prev) => prev.filter((req) => req.id !== docId));
      } catch (error) {
        notification.error({ message: "Eroare", description: "A apărut o eroare" });
      } finally {
        setPrepareAcceptLoading(null);
      }
    },
    []
  );

  const onTableChange = useCallback((pagination) => {
    setCurrentPage(pagination.current);
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Nume",
        dataIndex: "name",
        render: (rowData, { id }) => <Link to={`/doctor/${id}`}>{rowData}</Link>,
      },
      {
        title: "Specialitate",
        dataIndex: "category",
        render: (rowData) =>
          rowData
            .filter(Boolean)
            .map((cat) => cat.name_ro)
            .join(", "),
      },
      {
        title: "Acțiuni",
        render: (_, row) => (
          <>
            <Button
              type="primary"
              size="small"
              className="me-2"
              onClick={acceptHandler(row.id)}
              loading={prepareAcceptLoading === row.id}
            >
              Acceptă
            </Button>
            <Popconfirm
              title="Ești sigur ca vrei sa ștergi acestă cerere?"
              placement="left"
              onConfirm={removeHandler(row.id)}
              okText="Accept"
              cancelText="Anulează"
            >
              <Button type="primary" size="small" danger loading={removeReqLoading === row.id}>
                Șterge
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ],
    [acceptHandler, prepareAcceptLoading, removeHandler, removeReqLoading]
  );

  if (error) {
    return <Alert className="mt-5" showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }

  return (
    <>
      <PageHeader className="site-page-header" title="Cereri de la docotri" onBack={history.goBack} />
      <DcTable
        dataColumns={columns}
        dataSource={requests || []}
        loading={loading}
        onTabelChange={onTableChange}
        pagination={{
          position: ["bottomRight"],
          per_page: requests?.per_page,
          total: requests?.total,
          current_page: requests?.current_page,
        }}
      />
      <DoctorForm
        onClose={closeAcceptDrawer}
        onAfterSubmit={closeAcceptDrawer}
        onSubmitSuccess={onAcceptDocHanlder}
        submitBtnText="Acceptă"
        visible={acceptVisible}
        defaultValues={selectedDoctorData}
        docId={selectedDoctorData?.id}
      />
    </>
  );
}
