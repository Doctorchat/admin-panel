import { Button, Table, notification } from "antd";
import { useQuery } from "react-query";

import useTableState from "../../../hooks/usePaginatedQueryState";
import api from "../../../utils/appApi";
import { useCallback, useState } from "react";
import UserDetails from "./UserDetails";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessages";
import date from "../../../utils/date";
import DcTable from "../../../components/DcTabel";

export default function OnholdCalls() {
  const { page, sortColumn, sortDirection, onTableChange } = useTableState("onhold-calls");

  const [user, setUser] = useState(null);

  const {
    data: onholdCalls,
    isLoading,
    refetch,
  } = useQuery(["onhold-calls", page, sortColumn, sortDirection], () =>
    api.calls.onhold({
      page,
      sort_column: sortColumn,
      sort_direction: sortDirection === "ascend" ? "asc" : "desc",
    })
  );

  const onAssignUser = useCallback(
    async (user) => {
      try {
        await api.calls.assign(user.id);

        refetch();
        setUser(user);
      } catch (error) {
        notification.error({
          message: "Eroare",
          description: getApiErrorMessage(error),
        });
      }
    },
    [refetch]
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
      sortOrder: sortColumn === "id" && sortDirection,
    },
    {
      title: "Nume",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Data înregistrării",
      dataIndex: "created_at",
      sorter: true,
      sortOrder: sortColumn === "created_at" && sortDirection,
      render: (rowData) => date(rowData).full,
    },
    {
      title: "Acțiuni",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          disabled={!!record.manager_id}
          onClick={() => onAssignUser(record)}
        >
          Asignează
        </Button>
      ),
    },
  ];

  // Render with fallback in case of issues
  const renderTable = () => {
    try {
      return (
        <DcTable
          dataSource={onholdCalls?.data || []}
          dataColumns={columns}
          pagination={{
            current_page: onholdCalls?.current_page || 1,
            per_page: onholdCalls?.per_page || 20,
            total: onholdCalls?.total || 0,
            position: ["bottomRight"]
          }}
          loading={isLoading}
          onTableChange={onTableChange}
        />
      );
    } catch (error) {
      console.error("Error rendering DcTable:", error);
      // Fallback to original table
      return (
        <Table
          bordered
          scroll={{ x: 700 }}
          size="small"
          rowKey={(record) => record.id}
          sortDirections={["descend", "ascend", "descend"]}
          columns={columns}
          dataSource={onholdCalls?.data || []}
          loading={isLoading}
          pagination={{
            position: ["bottomRight"],
            current: onholdCalls?.current_page || 1,
            pageSize: onholdCalls?.per_page || 20,
            total: onholdCalls?.total || 0,
            showSizeChanger: false,
          }}
          onChange={onTableChange}
        />
      );
    }
  };

  return (
    <>
      <UserDetails
        user={user}
        onClose={() => {
          setUser(null);
          refetch();
        }}
      />

      {renderTable()}
    </>
  );
}
